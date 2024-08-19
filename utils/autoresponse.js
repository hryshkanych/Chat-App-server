import axios from 'axios';

export const getAutoresponse = async () => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    return response.data.content;
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return 'This is defauls quote.';
  }
};