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
import { memo } from 'react';
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
  indexAxis: 'y' as const,
  scales: {
    x: {
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

  defaults.borderColor = isDarkMode ? '#2b2b2d' : '#e1e3eb';
  defaults.color = isDarkMode ? '#e1e3eb' : '#545864';
  defaults.font.size = 16;
  defaults.font.family = 'Inter, sans-serif';

  const color = isDarkMode ? '#54527b' : '#dcc9e8';
  const backgroundColor = ['#b073d9', color, color];

  return (
    <div className="p-4 rounded-lg w-auto">
      {isDarkMode !== null && (
        <BarChart darkMode={isDarkMode} backgroundColor={backgroundColor} />
      )}
    </div>
  );
}

interface BarChartProps {
  backgroundColor: string[];
  darkMode: boolean;
}

export const BarChart = memo(
  function BarChart({ backgroundColor, darkMode: _darkMode }: BarChartProps) {
    return (
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
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.backgroundColor[0] === nextProps.backgroundColor[0] &&
      prevProps.darkMode === nextProps.darkMode
    );
  },
);
