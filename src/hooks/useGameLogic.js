import { useEffect, useState } from "react";

export const useGameLogic = (cardValues) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem("bestScore")) || null
  );
  const [isLocked, setIsLocked] = useState(false);

  //  Shuffle helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  //  Update card helper
  const updateCardById = (id, updates) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

  //  Initialize game
  const initializeGame = () => {
    const shuffled = shuffleArray(cardValues);
    const finalCards = shuffled.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(finalCards);
    setIsLocked(false);
    setMoves(0);
    setScore(0);
    setMatchedCards([]);
    setFlippedCards([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Handle card click
  const handleCardClick = (card) => {
    if (card.isFlipped || card.isMatched || isLocked || flippedCards.length === 2) {
      return;
    }

    updateCardById(card.id, { isFlipped: true });
    const newFlippedCards = [...flippedCards, card.id];
    setFlippedCards(newFlippedCards);

    if (flippedCards.length === 1) {
      setIsLocked(true);
      const firstCard = cards.find((c) => c.id === flippedCards[0]);

      if (firstCard.value === card.value) {
        // Match
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, firstCard.id, card.id]);
          setScore((prev) => prev + 1);
          updateCardById(firstCard.id, { isMatched: true });
          updateCardById(card.id, { isMatched: true });
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        //  Mismatch
        setTimeout(() => {
          updateCardById(firstCard.id, { isFlipped: false });
          updateCardById(card.id, { isFlipped: false });
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }

      setMoves((prev) => prev + 1);
    }
  };

  //  Track best score
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem("bestScore", moves);
      }
    }
  }, [matchedCards, cards, moves, bestScore]);

  const isGameComplete = matchedCards.length === cards.length;

  return {
    cards,
    score,
    moves,
    bestScore,
    isGameComplete,
    initializeGame,
    handleCardClick,
  };
};
