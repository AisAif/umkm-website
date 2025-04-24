export default {
  customActions: ['action_ask_product', 'action_ask_vehicle_model'],
  entities: ['product_name', 'vehicle_name'],
  slots: {
    product_name: {
      type: 'text',
      mappings: [
        // {
        //   type: 'from_entity',
        //   entity: 'product_name',
        // },
        {
          type: 'from_text',
        },
      ],
    },
    vehicle_name: {
      type: 'text',
      mappings: [
        // {
        //   type: 'from_entity',
        //   entity: 'vehicle_name',
        // },
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
        'Masih ada [Laser](product_name)?',
      ],
    },
    {
      intent: 'ask_vehicle_model',
      examples: [
        'Untuk mobil [Honda](vehicle_name)?',
        'Untuk motor [Yamaha](vehicle_name)?',
        'Mau pasang untuk [Suzuki](vehicle_name)?',
        'Ada billed apa [Vespa](vehicle_name)?',
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
