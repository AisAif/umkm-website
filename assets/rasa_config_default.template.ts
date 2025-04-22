export default {
  customActions: ['action_ask_product', 'action_ask_vehicle_model'],
  slots: {
    product_name: {
      type: 'text',
      mappings: [
        {
          type: 'from_entity',
          entity: 'product_name',
        },
        {
          type: 'from_text',
        },
      ],
    },
    vehicle_name: {
      type: 'text',
      mappings: [
        {
          type: 'from_entity',
          entity: 'vehicle_name',
        },
        {
          type: 'from_text',
        },
      ],
    },
  },
  intents: [
    {
      intent: 'ask_product',
      examples: [
        'Ada [Matrix](product_name)?',
        'Gadah [Bi Led](product_name)?',
        'Mau pasang [AES](product_name)',
        'Spesifikasi [LED](product_name)',
        '[Laser](product_name) masih ada?',
      ],
    },
    {
      intent: 'ask_vehicle_model',
      examples: [
        'Untuk mobil [Honda](vehicle_name)?',
        'Untuk motor [Yamaha](vehicle_name)?',
        'Mau pasang untuk [Suzuki](vehicle_name)?',
        '[Vespa](vehicle_name) ada billed apa?',
      ],
    },
  ],
  rules: [
    {
      rule: 'Tanya Produk',
      steps: [
        {
          intent: 'ask_product',
        },
        {
          action: 'action_ask_product',
        },
      ],
    },
    {
      rule: 'Tanya Kendaraan',
      steps: [
        {
          intent: 'ask_vehicle_model',
        },
        {
          action: 'action_ask_vehicle_model',
        },
      ],
    },
  ],
}
