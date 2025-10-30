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

  async scoreAssignment(submissionContent, assignmentTitle = '', assignmentInstruction = '') {
    if (!this.model) {
      throw new Error('Gemini API not available');
    }

    const scoringPrompt = this.buildScoringPrompt(submissionContent, assignmentTitle, assignmentInstruction);
    
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

    const results = [];
    
    for (const submission of submissions) {
      try {
        const scoringResult = await this.scoreAssignment(
          submission.content,
          assignment.title || assignment.name,
          assignment.instruction || assignment.description
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

  buildScoringPrompt(submissionContent, assignmentTitle = '', assignmentInstruction = '') {
    // Clean HTML from instruction for better readability
    let cleanInstruction = assignmentInstruction || '';
    if (cleanInstruction) {
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
    
    // Simple, straightforward scoring prompt
    const prompt = `You are evaluating a student's assignment submission.

ASSIGNMENT CONTEXT (Full Assignment Details):
Title: ${assignmentTitle || 'General Assignment'}

Complete Assignment Instructions and Requirements:
${cleanInstruction || 'Complete the assignment as specified'}

STUDENT SUBMISSION TO EVALUATE:
${submissionContent}

Please evaluate this submission against the assignment requirements above and provide a score from 1-10 based on:
- Relevance: Does it address the assignment requirements?
- Completeness: Does it cover all required aspects mentioned in the assignment?
- Quality: Is it clear, well-structured, and professional?
- Creativity: Does it show original thinking?

Respond with ONLY a JSON object in this format:
{
  "score": [number 1-10],
  "feedback": "[brief explanation of the score]"
}`;

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