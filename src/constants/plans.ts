export const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Comece a explorar.',
    price: { monthly: 'R$ 0' },
    features: [
      { limit: 200, name: '200 interações por dia' },
      { limit: 2, name: '2 artigos por dia' }
    ],
    buttonText: 'Começar Grátis',
    mostPopular: false,
  },
  {
    id: 'basic',
    name: 'Básico',
    description: 'Para uso moderado e regular',
    price: { monthly: 'R$ 14,90' },
    features: [
      { limit: 1000, name: '1000 interações por mês' },
      { limit: 10, name: '10 artigos por dia' }
    ],
    buttonText: 'Escolher Básico',
    mostPopular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para uso intensivo e profissional.',
    price: { monthly: 'R$ 79,90' },
    features: [
      { limit: 10000, name: '10.000 interações por mês' },
      { limit: 100, name: '100 artigos por dia' }
    ],
    buttonText: 'Escolher Pro',
    mostPopular: false,
  },
];
