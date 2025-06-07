interface DataExample {
  product_name: string[]
  tag_name: string[]
}

export default function (data: DataExample) {
  return {
    actions: ['action_ask_product', 'action_ask_tag_product'],
    entities: ['product_name', 'tag_name'],
    slots: {
      product_name: {
        type: 'text',
        mappings: [
          {
            type: 'from_entity',
            entity: 'product_name',
          },
        ],
      },
      tag_name: {
        type: 'text',
        mappings: [
          {
            type: 'from_entity',
            entity: 'tag_name',
          },
        ],
      },
    },
    intents: [
      {
        lookup: 'product_name',
        examples: data.product_name,
      },
      {
        lookup: 'tag_name',
        examples: data.tag_name,
      },
      {
        intent: 'ask_product',
        examples: [
          'Ada [Vario](product_name)?',
          'Gadah [PCX](product_name)?',
          'Mau pasang [Aerox](product_name)',
          'Spesifikasi [Beat](product_name)',
          'Masih ada [Scoopy](product_name)?',
        ],
      },
      {
        intent: 'ask_tag_product',
        examples: [
          'Untuk [Mobil](tag_name) bagusnya apa?',
          'Untuk [Motor](tag_name) ada rekomendasi?',
          'Mau pasang yang [RGB](tag_name)?',
          'Ada billed [PCX](tag_name)?',
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
            intent: 'ask_tag_product',
          },
          {
            action: 'action_ask_tag_product',
          },
        ],
      },
    ],
  }
}
