import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

class GeminiService {
  constructor() {
    this.apiKey = config.ai.geminiApiKey;
    this.genAI = null;
    this.model = null;
    
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.initializeModel();
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API:', error.message);
    }
  }

  async initializeModel() {
    try {
      // Use gemini-2.0-flash for fast, reliable responses
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      // Test if model is available
      await this.model.generateContent('test');
      console.log('✅ Gemini 2.0 Flash model initialized successfully');
    } catch (error) {
      try {
        // Fallback to gemini-2.0-pro for more advanced reasoning
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-pro' });
        await this.model.generateContent('test');
        console.log('✅ Gemini 2.0 Pro model initialized successfully (fallback)');
      } catch (fallbackError) {
        console.error('❌ Both Gemini models failed to initialize:', fallbackError.message);
        this.model = null;
      }
    }
  }

  async scoreAssignment(submissionContent, assignmentTitle = '', assignmentInstruction = '', assignmentRequirements = []) {
    if (!this.model) {
      throw new Error('Gemini API not available');
    }

    const scoringPrompt = this.buildScoringPrompt(submissionContent, assignmentTitle, assignmentInstruction, assignmentRequirements);
    
    try {
      console.log(`[Gemini] Scoring submission for assignment: ${assignmentTitle}`);
      const result = await this.model.generateContent(scoringPrompt);
      const response = await result.response;
      const text = response.text();
      
      const scoringResult = this.parseScoringResponse(text);
      console.log(`[Gemini] Score: ${scoringResult.score}/10`);
      
      return scoringResult;
    } catch (error) {
      console.error('❌ Error scoring assignment:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  // Score multiple submissions (used by trainer to score all at once)
  async scoreMultiple(submissions, assignment, rubric = {}) {
    if (!this.model) {
      throw new Error('Gemini API not available');
    }

    // Extract assignment requirements from description/instruction HTML
    // Check both 'instruction' and 'description' fields
    const instructionHtml = assignment.instruction || assignment.description || '';
    let requirements = [];
    
    if (instructionHtml) {
      // Remove HTML tags for cleaner text extraction
      const textOnly = instructionHtml.replace(/<[^>]*>/g, ' ');
      
      // Try to extract requirements from HTML list items
      const requirementMatch = instructionHtml.match(/<li>(.+?)<\/li>/g);
      if (requirementMatch) {
        requirements = requirementMatch.map(li => li.replace(/<\/?li>/g, '').replace(/<[^>]*>/g, '').trim());
      }
      
      // If no list items found, try to extract from "Your Task:" or "Requirements:" sections
      if (requirements.length === 0) {
        const taskMatch = instructionHtml.match(/(?:Your Task|Requirements?|Task|Assignment):\s*(.+?)(?=<h|<div|$)/is);
        if (taskMatch) {
          const taskText = taskMatch[1].replace(/<[^>]*>/g, ' ').trim();
          if (taskText) {
            requirements.push(taskText);
          }
        }
      }
      
      // Extract evaluation criteria if present
      const criteriaMatch = instructionHtml.match(/(?:evaluate|evaluation|scoring|criteria).*?<li>(.+?)<\/li>/gis);
      if (criteriaMatch) {
        criteriaMatch.forEach(match => {
          const criterion = match.replace(/<\/?li>/g, '').replace(/<[^>]*>/g, '').trim();
          if (criterion) {
            requirements.push(`Evaluation: ${criterion}`);
          }
        });
      }
    }

    const results = [];
    
    for (const submission of submissions) {
      try {
        const scoringResult = await this.scoreAssignment(
          submission.content,
          assignment.title || assignment.name,
          assignment.instruction || assignment.description,
          requirements
        );
        
        results.push({
          submissionId: submission.id,
          score: scoringResult.score,
          feedback: scoringResult.feedback,
          breakdown: scoringResult.breakdown
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error scoring submission ${submission.id}:`, error.message);
        results.push({
          submissionId: submission.id,
          score: 0,
          feedback: `Scoring error: ${error.message}`,
          breakdown: {}
        });
      }
    }
    
    return results;
  }

  buildScoringPrompt(submissionContent, assignmentTitle = '', assignmentInstruction = '', assignmentRequirements = []) {
    // Clean HTML from instruction for better readability (but keep structure)
    let cleanInstruction = assignmentInstruction || '';
    if (cleanInstruction) {
      // Convert common HTML tags to readable format
      cleanInstruction = cleanInstruction
        .replace(/<h[1-6][^>]*>(.+?)<\/h[1-6]>/gi, '\n### $1\n')
        .replace(/<strong>(.+?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.+?)<\/em>/gi, '*$1*')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<li>(.+?)<\/li>/gi, '\n- $1')
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '\n')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }
    
    // Build strict scoring prompt with assignment context
    let prompt = `
You are a strict but fair AI trainer evaluating assignment submissions. Your job is to ensure submissions actually complete the assigned task.

ASSIGNMENT DETAILS:
Title: ${assignmentTitle || 'General Assignment'}

FULL ASSIGNMENT INSTRUCTIONS:
${cleanInstruction || 'Complete the assignment as specified'}

${assignmentRequirements.length > 0 ? `\nKEY REQUIREMENTS (extracted for clarity):\n${assignmentRequirements.map(req => `- ${req}`).join('\n')}` : ''}

STUDENT SUBMISSION TO EVALUATE:
${submissionContent}

CRITICAL EVALUATION RULES:
1. If the submission is COMPLETELY IRRELEVANT to the assignment (e.g., wrong topic, error messages, random text, copied from elsewhere), give it 1-2/10 with a clear explanation that it doesn't address the assignment.
2. If the submission is PARTIALLY relevant but misses key requirements, score 3-6/10.
3. If the submission addresses the assignment but has issues, score 7-8/10.
4. Only give 9-10/10 for exceptional work that fully meets all requirements.

SCORING CRITERIA (Total: 10 points):
- RELEVANCE & ACCURACY (4 points): Does the submission actually address the assignment? Is it relevant to the task?
  * 0-1 points: Completely irrelevant, wrong topic, or doesn't address assignment at all
  * 2 points: Partially relevant but mostly off-topic
  * 3 points: Relevant but has major inaccuracies
  * 4 points: Fully relevant and accurate
- COMPLETENESS (3 points): Does it address all required aspects?
  * 0 points: Missing most requirements
  * 1 point: Addresses some requirements
  * 2 points: Addresses most requirements
  * 3 points: Addresses all requirements fully
- QUALITY & CLARITY (2 points): Is it well-structured, clear, and professional?
  * 0 points: Poorly structured, unclear
  * 1 point: Somewhat clear but needs improvement
  * 2 points: Clear and well-structured
- CREATIVITY & DEPTH (1 point): Shows original thinking and goes beyond basics
  * 0 points: Basic, no original thought
  * 1 point: Shows some original thinking or depth

IMPORTANT: Be STRICT about relevance. A submission that doesn't address the assignment should NEVER score above 3/10.

RESPONSE FORMAT (JSON only):
{
  "score": [number between 1-10 - be strict if submission is irrelevant],
  "feedback": "[constructive feedback explaining the score. If submission is irrelevant, clearly state why]",
  "breakdown": {
    "relevance": [score out of 4],
    "completeness": [score out of 3], 
    "quality": [score out of 2],
    "creativity": [score out of 1]
  }
}

Please provide ONLY the JSON response, no additional text.`;

    return prompt;
  }

  parseScoringResponse(responseText) {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate score is between 1-10
      if (parsed.score < 1 || parsed.score > 10) {
        throw new Error('Score out of range');
      }
      
      return {
        score: Math.round(parsed.score),
        feedback: parsed.feedback || 'No feedback provided',
        breakdown: parsed.breakdown || {}
      };
    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error.message);
      console.error('Raw response:', responseText);
      
      // Fallback: extract score manually if JSON parsing fails
      const scoreMatch = responseText.match(/score["\s]*:[\s]*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5; // Default to 5 if can't parse
      
      return {
        score: Math.max(1, Math.min(10, score)),
        feedback: 'AI scoring completed with limited feedback due to parsing error',
        breakdown: {}
      };
    }
  }

  isAvailable() {
    return this.model !== null;
  }
}

// Export singleton instance
export default new GeminiService();