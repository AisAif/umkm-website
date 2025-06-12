import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { usePage } from '@inertiajs/react'
import BotsController from '#controllers/bots_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { IntentMetrics } from '#services/bot_service'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const IntentChart = () => {
  const { data: evaluationData } = usePage().props as unknown as InferPageProps<
    BotsController,
    'evaluation'
  >
  const report = evaluationData.intent_evaluation.report
  const labels = Object.keys(report).filter(
    (key) => !['accuracy', 'macro avg', 'weighted avg', 'micro avg'].includes(key)
  )

  const f1Scores = labels.map((label) => (report[label] as IntentMetrics)['f1-score'])
  const precision = labels.map((label) => (report[label] as IntentMetrics)['precision'])
  const recall = labels.map((label) => (report[label] as IntentMetrics)['recall'])

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'F1-Score',
        data: f1Scores,
        backgroundColor: 'rgba(75, 192, 192, 0.8)', // Sedikit lebih opak
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Precision',
        data: precision,
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recall',
        data: recall,
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {' '}
      {/* Tailwind classes applied here */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Intent Performance Chart</h2>
      <div className="h-96">
        {' '}
        {/* Memberi tinggi agar chart terlihat jelas */}
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    size: 14, // Ukuran font legenda
                  },
                },
              },
              title: {
                display: true,
                text: 'F1-Score, Precision, and Recall per Intent',
                font: {
                  size: 18, // Ukuran font judul chart
                },
                color: '#333', // Warna judul
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
                title: {
                  display: true,
                  text: 'Score',
                  font: {
                    size: 14,
                  },
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Intent',
                  font: {
                    size: 14,
                  },
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default IntentChart
