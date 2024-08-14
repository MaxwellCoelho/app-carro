export const VALUATION = [
  { name: 'Péssimo', id: 'pessimo l', value: 0.5 },
  { name: 'Péssimo', id: 'pessimo r', value: 1 },
  { name: 'Ruim', id: 'ruim l', value: 1.5 },
  { name: 'Ruim', id: 'ruim r', value: 2 },
  { name: 'Regular', id: 'regular l', value: 2.5 },
  { name: 'Regular', id: 'regular r', value: 3 },
  { name: 'Bom', id: 'bom l', value: 3.5 },
  { name: 'Bom', id: 'bom r', value: 4 },
  { name: 'Ótimo', id: 'otimo l', value: 4.5 },
  { name: 'Ótimo', id: 'otimo r', value: 5 }
];

export const VALUATION_NOT_FOUND = { name: 'Indisponível', id: 'indisponivel', value: 0 };

export const VALUATION_ITENS_CAR = [
  { title: 'Exterior', subtitle: 'Beleza, acabamento e design', value:'outside', valuation: null },
  { title: 'Interior', subtitle: 'Acabamento, espaço e conforto', value:'inside', valuation: null },
  { title: 'Dirigibilidade', subtitle: 'Volante, câmbio e instrumentos', value:'confort', valuation: null },
  { title: 'Desempenho', subtitle: 'Potência do motor e retomadas', value:'durability', valuation: null },
  { title: 'Segurança', subtitle: 'Estabilidade e frenagem', value:'safety', valuation: null },
  { title: 'Autonomia', subtitle: 'Consumo na cidade e estrada', value:'consumption', valuation: null },
  { title: 'Custo-benefício', subtitle: 'Vale a pena? Recomendaria?', value:'worth', valuation: null }
];

export const VALUATION_ITENS_BRAND = [
  { title: 'Serviços', subtitle: 'Revisão e manutenção', value:'services', valuation: null },
  { title: 'Atendimento', subtitle: 'Cordialidade e cumprimeto de prazos', value:'people', valuation: null },
  { title: 'Preços', subtitle: 'Carros, peças e serviços', value:'prices', valuation: null },
  { title: 'Credibilidade', subtitle: 'Transmite confiança em seus produtos e serviços?', value:'credibility', valuation: null },
  { title: 'Satisfação', subtitle: 'Recomendaria ou compraria novamente?', value:'satisfaction', valuation: null }
];
