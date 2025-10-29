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

  async scoreAssignment(assignmentContent, assignmentType = 'general') {
    if (!this.model) {
      throw new Error('Gemini API not available');
    }

    const scoringPrompt = this.buildScoringPrompt(assignmentContent, assignmentType);
    
    try {
      const result = await this.model.generateContent(scoringPrompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseScoringResponse(text);
    } catch (error) {
      console.error('❌ Error scoring assignment:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  buildScoringPrompt(content, assignmentType) {
    const basePrompt = `
You are an expert AI trainer evaluating assignment submissions. Please score this submission from 1-10 and provide constructive feedback.

ASSIGNMENT CONTENT:
${content}

SCORING CRITERIA (Total: 10 points):
- Clarity (2 points): Is the response clear and well-structured?
- Completeness (3 points): Does it address all required aspects?
- Creativity (2 points): Shows original thinking and innovative approaches
- Accuracy (3 points): Correct information and appropriate solutions

RESPONSE FORMAT (JSON only):
{
  "score": [number between 1-10],
  "feedback": "[constructive feedback in 2-3 sentences]",
  "breakdown": {
    "clarity": [score out of 2],
    "completeness": [score out of 3], 
    "creativity": [score out of 2],
    "accuracy": [score out of 3]
  }
}

Please provide ONLY the JSON response, no additional text.`;

    return basePrompt;
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