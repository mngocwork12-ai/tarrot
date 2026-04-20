// Global variables for DOM elements and constants
const grid = document.getElementById('cardGrid');
const CARDS_JSON = 'cards.json';

// Utility function to shuffle an array in place using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to create a DOM element for a card with necessary data attributes and HTML structure
function createCardElement(card, originalIndex, gridIndex) {
  const element = document.createElement('div');
  element.classList.add('backcard');

  // Store card data in dataset for later access
  element.dataset.index = originalIndex;
  element.dataset.gridIndex = gridIndex;
  element.dataset.cardName = card.name;
  element.dataset.cardNumber = card.number;
  element.dataset.cardImage = card.img;

  // HTML structure for the card back design
  element.innerHTML = `
    <div class="inner"></div>
    <div class="tri-up"></div>
    <div class="tri-down"></div>
    <div class="dot"></div>
  `;

  return element;
}

// Asynchronous function to load cards from JSON, shuffle them, and populate the grid
async function initCardGrid() {
  try {
    // Fetch the cards data
    const response = await fetch(CARDS_JSON);
    if (!response.ok) throw new Error(`Failed to load ${CARDS_JSON}: ${response.status}`);

    // Parse JSON and extract cards array
    const data = await response.json();
    const cards = Array.isArray(data.cards) ? data.cards : [];
    // Shuffle a copy of the cards array
    const shuffledCards = shuffleArray(cards.slice());

    // Clear the grid and add shuffled cards
    grid.innerHTML = '';
    shuffledCards.forEach((card, index) => {
      const originalIndex = cards.indexOf(card);
      const cardElement = createCardElement(card, originalIndex, index);
      cardElement.dataset.cardImg = card.img; 
      grid.appendChild(cardElement);
    });
  } catch (error) {
    console.error(error);
    // Display error message in the grid if loading fails
    grid.innerHTML = '<p>Unable to load cards. Please check cards.json.</p>';
  }
}

// Event handler for clicking on cards to toggle selection
function handleCardClick(event) {
  const card = event.target.closest('.backcard');
  if (!card) return;
  card.classList.toggle('card-selected');
}

// Attach click event listener to the card grid
grid.addEventListener('click', handleCardClick);

// Get reference to the question form
const questionForm = document.querySelector('.questionpanel');
// turn the confirm into loading 
// turn the confirm into loading 
const submitbutton = document.getElementById('submitbutton');
submitbutton.addEventListener('click', function() {
  submitbutton.style.display = 'none';
  document.getElementById('loadingSpinner').style.display = 'block';
});


questionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = questionForm.querySelector('input[type="text"]');
  const question = input.value.trim();
  if (!question) return;

  const selectedCards = Array.from(document.querySelectorAll('.backcard.card-selected')).map(card => ({
    name: card.dataset.cardName,
    number: card.dataset.cardNumber,
    img: card.dataset.cardImg
  }));

  if (selectedCards.length === 0) {
    alert('Please select at least one card.');
    return;
  }

  try {
    const aiResponse = await query(question, selectedCards);

    const params = new URLSearchParams({
      question: question,
      cards: JSON.stringify(selectedCards),
      response: aiResponse
    });
    window.location.href = `response.html?${params.toString()}`;

  } catch (error) {
    console.error('AI query failed:', error);

    const params = new URLSearchParams({
      question: question,
      cards: JSON.stringify(selectedCards),
      response: `Error: ${error.message}`
    });
    window.location.href = `response.html?${params.toString()}`;
  }
});

window.addEventListener('DOMContentLoaded', initCardGrid);