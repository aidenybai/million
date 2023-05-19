import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  defaults,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useDarkMode } from './use-dark-mode';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const data = [
  { framework: 'JavaScript', val: 0.96 },
  { framework: 'Million.js', val: 0.92 },
  { framework: 'Preact', val: 0.59 },
  { framework: 'React', val: 0.26 },
];

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      max: 1,
      ticks: {
        format: {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        },
      },
    },
  },
};

export function Chart() {
  const isDarkMode = useDarkMode();

  defaults.borderColor = isDarkMode ? '#545864' : '#bdbfc7';
  defaults.color = isDarkMode ? '#bdbfc7' : '#545864';

  const color = isDarkMode ? '#54527b' : '#dcc9e8';
  const backgroundColor = [color, '#b073d9', color, color];

  return (
    <div className="p-4 rounded-lg w-auto min-h-[270px]">
      {isDarkMode !== null && (
        <Bar
          redraw
          options={options}
          data={{
            labels: data.map((row) => row.framework),
            datasets: [
              {
                label: '% of vanilla JavaScript',
                data: data.map((row) => row.val),
                backgroundColor,
                barPercentage: 0.5,
              },
            ],
          }}
        />
      )}
    </div>
  );
}
