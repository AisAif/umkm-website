import BotsController from '#controllers/bots_controller'
import { AverageMetrics, IntentMetrics } from '#services/bot_service'
import { InferPageProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/react'

const IntentTable = () => {
  const { data: evaluationData } = usePage().props as unknown as InferPageProps<
    BotsController,
    'evaluation'
  >
  const report = evaluationData.intent_evaluation.report
  const intents = Object.keys(report).filter(
    (key) => !['accuracy', 'macro avg', 'weighted avg', 'micro avg'].includes(key)
  )

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Intent Evaluation Report Table</h2>
      <div className="overflow-x-auto">
        {' '}
        {/* Untuk scroll horizontal pada tabel di layar kecil */}
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Intent
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Precision
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Recall
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                F1-Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Support
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Confused With
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {intents.map((intent) => (
              <tr key={intent} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {intent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(report[intent] as IntentMetrics).precision.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(report[intent] as IntentMetrics).recall.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(report[intent] as IntentMetrics)['f1-score'].toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(report[intent] as IntentMetrics).support}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Object.keys((report[intent] as IntentMetrics).confused_with).length > 0 ? (
                    <ul className="list-disc pl-5">
                      {' '}
                      {/* Menggunakan list-disc untuk bullet point */}
                      {Object.entries((report[intent] as IntentMetrics).confused_with).map(
                        ([confusedIntent, count]) => (
                          <li key={confusedIntent}>
                            {confusedIntent}: {count}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
            {/* Summary Rows */}
            <tr className="bg-gray-100 font-bold text-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm" colSpan={1}>
                **Accuracy**
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm" colSpan={5}>
                {evaluationData.intent_evaluation.accuracy.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-gray-100 font-bold text-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm">**Macro Avg**</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['macro avg'] as AverageMetrics).precision.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['macro avg'] as AverageMetrics).recall.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['macro avg'] as AverageMetrics)['f1-score'].toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['macro avg'] as AverageMetrics).support}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
            </tr>
            <tr className="bg-gray-100 font-bold text-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm">**Weighted Avg**</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['weighted avg'] as AverageMetrics).precision.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['weighted avg'] as AverageMetrics).recall.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['weighted avg'] as AverageMetrics)['f1-score'].toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['weighted avg'] as AverageMetrics).support}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
            </tr>
            <tr className="bg-gray-100 font-bold text-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm">**Micro Avg**</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['micro avg'] as AverageMetrics).precision.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['micro avg'] as AverageMetrics).recall.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['micro avg'] as AverageMetrics)['f1-score'].toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {(report['micro avg'] as AverageMetrics).support}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Errors (Sample)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Text
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actual Intent
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Predicted Intent
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluationData.intent_evaluation.errors.map((error, index) => (
              <tr key={index} className="hover:bg-red-50">
                {' '}
                {/* Highlight error rows */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{error.text}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {' '}
                  {/* Warna merah untuk actual intent error */}
                  {error.intent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  {' '}
                  {/* Warna biru untuk predicted intent error */}
                  {error.intent_prediction.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {error.intent_prediction.confidence.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IntentTable
