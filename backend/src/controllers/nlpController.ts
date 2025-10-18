import { Request, Response } from 'express';
import { processVoiceCommand, getVoiceCommandAnalytics } from '../services/nlpService';

/**
 * Process voice command through NLP
 * POST /api/nlp/process
 */
export async function processVoice(req: Request, res: Response) {
  try {
    const { text, userContext } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }
    
    console.log('Processing voice command:', text);
    
    const result = await processVoiceCommand(text, userContext);
    
    return res.json(result);
    
  } catch (error: any) {
    console.error('Voice processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get voice command analytics
 * GET /api/nlp/analytics
 */
export async function getAnalytics(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    
    const result = await getVoiceCommandAnalytics(userId as string);
    
    return res.json(result);
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Test NLP endpoint
 * POST /api/nlp/test
 */
export async function testNLP(req: Request, res: Response) {
  try {
    const testCommands = [
      'find best clinics near me',
      'show saved resources',
      'i want blood bank',
      'emergency hospital',
      'नजदीकी फार्मेसी',
      'దగ్గర్లో క్లినిక్',
      'open pharmacy now'
    ];
    
    const results = [];
    
    for (const command of testCommands) {
      const result = await processVoiceCommand(command);
      results.push({
        input: command,
        output: result.data
      });
    }
    
    return res.json({
      success: true,
      testResults: results
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
}