// controllers/trip.controller.js
const axios = require('axios');

// Mock AI API response - in production, this would call a real AI service
const generateTripPlan = async (destination, budget, preferences) => {
  try {
    // This is a mock implementation - replace with actual AI API call
    const tripPlan = {
      destination: destination,
      budget: budget,
      duration: budget === 'low' ? '3-5 days' : budget === 'medium' ? '5-7 days' : '7-10 days',
      accommodation: {
        low: 'Budget hotels and hostels',
        medium: 'Mid-range hotels and boutique stays',
        high: 'Luxury hotels and resorts'
      }[budget],
      activities: {
        adventure: ['Hiking', 'Rock climbing', 'Water sports', 'Zip lining'],
        relaxing: ['Spa treatments', 'Beach lounging', 'Yoga sessions', 'Meditation retreats'],
        cultural: ['Museum visits', 'Historical tours', 'Local workshops', 'Traditional performances'],
        wildlife: ['Safari tours', 'Bird watching', 'Nature walks', 'Wildlife photography'],
        luxury: ['Private tours', 'Fine dining', 'Helicopter rides', 'Exclusive experiences']
      }[preferences.travelStyle] || ['Sightseeing', 'Local cuisine', 'Shopping', 'Photography'],
      estimatedCost: {
        low: '$500-1000',
        medium: '$1000-2500',
        high: '$2500-5000+'
      }[budget],
      recommendations: [
        'Book accommodations in advance',
        'Research local customs and etiquette',
        'Pack according to the weather',
        'Get travel insurance',
        'Learn basic local phrases'
      ]
    };

    return tripPlan;
  } catch (error) {
    throw new Error('Failed to generate trip plan');
  }
};

const createTripPlan = async (req, res) => {
  try {
    const { destination, budget, preferences } = req.body;

    // Validate required fields
    if (!destination || !budget) {
      return res.status(400).json({ 
        error: 'Destination and budget are required' 
      });
    }

    // Validate budget levels
    const validBudgets = ['low', 'medium', 'high'];
    if (!validBudgets.includes(budget)) {
      return res.status(400).json({ 
        error: 'Budget must be low, medium, or high' 
      });
    }

    // Generate trip plan
    const tripPlan = await generateTripPlan(destination, budget, preferences);

    res.json({
      success: true,
      tripPlan,
      message: 'Trip plan generated successfully'
    });

  } catch (error) {
    console.error('Trip planning error:', error);
    res.status(500).json({ 
      error: 'Failed to create trip plan',
      message: error.message 
    });
  }
};

const getTripSuggestions = async (req, res) => {
  try {
    const { destination } = req.params;
    
    // Mock suggestions based on destination
    const suggestions = {
      'India': {
        cities: ['Mumbai', 'Delhi', 'Jaipur', 'Agra', 'Varanasi'],
        highlights: ['Taj Mahal', 'Red Fort', 'Gateway of India', 'Golden Temple'],
        bestTime: 'October to March',
        currency: 'Indian Rupee (INR)'
      },
      'France': {
        cities: ['Paris', 'Lyon', 'Nice', 'Bordeaux', 'Marseille'],
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
        bestTime: 'April to October',
        currency: 'Euro (EUR)'
      },
      'Japan': {
        cities: ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo', 'Fukuoka'],
        highlights: ['Mount Fuji', 'Senso-ji Temple', 'Fushimi Inari', 'Tokyo Tower'],
        bestTime: 'March to May and September to November',
        currency: 'Japanese Yen (JPY)'
      }
    };

    const destinationData = suggestions[destination] || {
      cities: ['Explore local attractions'],
      highlights: ['Discover local culture'],
      bestTime: 'Check local weather',
      currency: 'Check local currency'
    };

    res.json({
      success: true,
      destination: destination,
      suggestions: destinationData
    });

  } catch (error) {
    console.error('Trip suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get trip suggestions',
      message: error.message 
    });
  }
};

module.exports = {
  createTripPlan,
  getTripSuggestions
}; 