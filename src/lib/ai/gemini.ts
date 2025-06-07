import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * General function to call specific Gemini AI functions based on the type
 * @param functionType The type of generative function to call
 * @param params Parameters to pass to the specific function
 * @returns The response from the specific function
 */
export async function getGenerativeAIResponse(
  functionType: string,
  params: Record<string, any>
) {
  try {
    switch (functionType) {
      case 'inventoryForecasting':
        return await generateInventoryForecast(
          params.historicalData || params.products,
          params.productInfo || params.products
        );
      
      case 'supplierRecommendations':
        return await generateSupplierRecommendations(
          params.productData || params.products,
          params.supplierData || params.suppliers
        );
      
      case 'batchOperations':
      case 'batchSuggestions':
        return await generateBatchSuggestions(
          params.productsData || params.products,
          params.goal || params.customPrompt || 'Optimize inventory levels'
        );
      
      case 'inventoryInsights':
      case 'pricingOptimization':
      case 'categorySuggestions':
      default:
        return await generateInventoryInsights(
          params.analyticsData || params.products
        );
    }
  } catch (error) {
    console.error(`Error in getGenerativeAIResponse (${functionType}):`, error);
    throw new Error(`Failed to generate AI response for ${functionType}`);
  }
}

/**
 * Generate inventory forecasts using Gemini AI
 */
export async function generateInventoryForecast(historicalData: any, productInfo: any) {
  try {
    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings,
    });

    // Prepare prompt with instructions and data
    const prompt = `
    As an inventory forecasting system, analyze the following historical inventory data and product information to generate a 90-day forecast.
    
    PRODUCT INFORMATION:
    ${JSON.stringify(productInfo, null, 2)}
    
    HISTORICAL INVENTORY MOVEMENTS:
    ${JSON.stringify(historicalData, null, 2)}
    
    Please provide a forecast with the following structure:
    1. Predicted inventory levels for 30, 60, and 90 days from now
    2. Confidence level for each prediction (0-1)
    3. Key factors influencing the forecast
    4. Recommended reorder points and quantities
    
    Return the results as valid JSON with this structure:
    {
      "predictions": [
        { "days": 30, "quantity": number, "confidence": number },
        { "days": 60, "quantity": number, "confidence": number },
        { "days": 90, "quantity": number, "confidence": number }
      ],
      "factors": [ string, string, ... ],
      "recommendations": {
        "reorderPoint": number,
        "reorderQuantity": number,
        "explanation": string
      }
    }
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      [null, text];
    
    const jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating forecast with Gemini:', error);
    throw new Error('Failed to generate inventory forecast');
  }
}

/**
 * Generate supplier recommendations using Gemini AI
 */
export async function generateSupplierRecommendations(productData: any, supplierData: any) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings,
    });

    const prompt = `
    As a supplier optimization assistant, analyze the following product and supplier data to recommend the best suppliers.
    
    PRODUCT DATA:
    ${JSON.stringify(productData, null, 2)}
    
    AVAILABLE SUPPLIERS:
    ${JSON.stringify(supplierData, null, 2)}
    
    Please provide recommendations with the following structure:
    1. Ranked list of recommended suppliers with reasoning
    2. Suggested order quantities and timing
    3. Potential cost savings opportunities
    
    Return the results as valid JSON with this structure:
    {
      "recommendations": [
        {
          "supplierId": string,
          "name": string,
          "rank": number,
          "reasoning": string,
          "suggestedOrderQuantity": number,
          "estimatedUnitPrice": number,
          "potentialSavings": number
        }
      ],
      "orderingStrategy": {
        "optimalOrderFrequency": string,
        "nextOrderDate": string,
        "explanation": string
      },
      "additionalInsights": [ string, string, ... ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      [null, text];
    
    const jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating supplier recommendations with Gemini:', error);
    throw new Error('Failed to generate supplier recommendations');
  }
}

/**
 * Generate batch operation suggestions using Gemini AI
 */
export async function generateBatchSuggestions(productsData: any, goal: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings,
    });

    const prompt = `
    As an inventory optimization assistant, analyze the following products and suggest improvements based on the stated goal.
    
    GOAL: ${goal}
    
    PRODUCTS:
    ${JSON.stringify(productsData, null, 2)}
    
    Please provide specific suggestions for batch updates with the following structure:
    1. Suggested changes for each product
    2. Reasoning behind each suggestion
    3. Expected impact of the changes
    
    Return the results as valid JSON with this structure:
    {
      "batchSuggestions": {
        "common": {
          "fields": { field: value, field: value, ... },
          "reasoning": string,
          "applicableToAll": boolean
        },
        "productSpecific": [
          {
            "productId": string,
            "changes": { field: value, field: value, ... },
            "reasoning": string,
            "priority": "high" | "medium" | "low"
          }
        ]
      },
      "expectedImpact": string,
      "additionalRecommendations": [ string, string, ... ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      [null, text];
    
    const jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating batch suggestions with Gemini:', error);
    throw new Error('Failed to generate batch update suggestions');
  }
}

/**
 * Generate inventory analytics insights using Gemini AI
 */
export async function generateInventoryInsights(analyticsData: any) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings,
    });

    const prompt = `
    As an inventory analytics expert, analyze the following data and provide insights on inventory performance.
    
    ANALYTICS DATA:
    ${JSON.stringify(analyticsData, null, 2)}
    
    Please provide insights with the following structure:
    1. Key performance metrics and their interpretation
    2. Notable trends or anomalies
    3. Actionable recommendations
    4. Risk factors to monitor
    
    Return the results as valid JSON with this structure:
    {
      "keyMetrics": [
        {
          "metric": string,
          "value": number,
          "interpretation": string,
          "trend": "improving" | "declining" | "stable"
        }
      ],
      "insights": [
        {
          "title": string,
          "description": string,
          "significance": "high" | "medium" | "low",
          "category": "opportunity" | "risk" | "observation"
        }
      ],
      "recommendations": [
        {
          "action": string,
          "priority": "high" | "medium" | "low",
          "expectedOutcome": string,
          "timeframe": string
        }
      ],
      "riskFactors": [ string, string, ... ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      [null, text];
    
    const jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating inventory insights with Gemini:', error);
    throw new Error('Failed to generate inventory analytics insights');
  }
}

// Export individual functions and a default object with all functions
export default {
  getGenerativeAIResponse,
  generateInventoryForecast,
  generateSupplierRecommendations,
  generateBatchSuggestions,
  generateInventoryInsights
}; 