$('#plotGraphButton').on('click', function() {
  const rules = getRulesFromTable();
  const word = $('#workRow').val();
  const uniqueChars = [...new Set(word.split(''))];

  if (word === '') {
    $('#workRow').css('border', '2px solid red');
    alert('Введіть алфавіт');
    return;
  } else {
    $('#workRow').css('border', '');
  }

  if (rules.sample.length === 0 || rules.sample.every(sample => sample === '')) {
    $('#myTable').css('border', '2px solid red');
    alert('Введіть правила');
    return;
  } else {
    $('#myTable').css('border', '');
  }

  if (uniqueChars.length > 5) {
    alert('В алфавіті має бути не більше 5 символів');
    return;
  }

  const iterations = [];
  let stopExecution = false; // Додано
  for (let n = 1; n <= 8 && !stopExecution; n++) { // Додано умову && !stopExecution
    let maxIterations = 0;
    const generateCombinations = (prefix, length) => {
      if (length === 0) {
        const result = markovAlgorithmComplete(rules, prefix);
        if (result.hasReachedMaxIterations) { // Перевірка
          alert('Перевірте вхідні дані');
          stopExecution = true; // Зупиняємо виконання
          return;
        }
        if (result.count.applied > maxIterations) {
          maxIterations = result.count.applied;
        }
        return;
      }
      for (let char of uniqueChars) {
        if (stopExecution) return; // Додано для зупинки подальшого виконання
        generateCombinations(prefix + char, length - 1);
      }
    };
    generateCombinations('', n);
    if (stopExecution) break; // Додано для виходу з циклу
    iterations.push(maxIterations);
  }

  if (stopExecution) return; // Додано для зупинки побудови графіку

  const ctx = document.getElementById('chart').getContext('2d');
  if (window.chartInstance) {
    window.chartInstance.destroy();
  }
  window.chartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Емпіричні дані',
          data: iterations.map((y, i) => ({ x: i + 1, y })),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 1)',
          showLine: false,
          pointRadius: 5
        }
      ]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Довжина слова'
          },
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return Number.isInteger(value) ? value : '';
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Кількість ітерацій'
          },
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return Number.isInteger(value) ? value : '';
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black'
          }
        }
      }
    }
  });

  $('#graphContainer').addClass('white-background');
  $('#graphControls').show();
});

$('#functionSelect').on('change', function() {
  const selectedFunction = $(this).val();
  if (selectedFunction === "none") {
    if (window.chartInstance.data.datasets.length > 1) {
      window.chartInstance.data.datasets.pop();
      window.chartInstance.update();
    }
    $('#equationText').text('');
    return;
  }

  const iterations = window.chartInstance.data.datasets[0].data.map(point => point.y);
  const theoreticalComplexity = findBestFitFunction(iterations, selectedFunction);
  const equation = getEquation(selectedFunction, theoreticalComplexity);

  const theoreticalData = theoreticalComplexity.map((y, i) => ({ x: i + 1, y }));

  if (window.chartInstance.data.datasets.length > 1) {
    window.chartInstance.data.datasets.pop();
  }

  window.chartInstance.data.datasets.push({
    label: 'Теоретична функція',
    data: theoreticalData,
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderWidth: 1,
    borderDash: [10, 5],
    fill: false,
    showLine: true,
    pointRadius: 0
  });

  window.chartInstance.update();

  $('#equationText').text(equation);
});

function findBestFitFunction(data, selectedFunction) {
  const x = [1, 2, 3, 4, 5, 6, 7, 8];
  const y = data;
  const input = x.map((xi, i) => [xi, y[i]]);

  let result;
  switch (selectedFunction) {
    case 'linear':
      result = regression.linear(input);
      break;
    case 'quadratic':
      result = regression.polynomial(input, { order: 2 });
      break;
    case 'cubic':
      result = regression.polynomial(input, { order: 3 });
      break;
    case 'exponential':
      result = regression.exponential(input);
      break;
    case 'logarithmic':
      result = regression.logarithmic(input);
      break;
    default:
      result = regression.linear(input);
  }

  return result.points.map(point => point[1]);
}

function getEquation(type, data) {
  const x = [1, 2, 3, 4, 5, 6, 7, 8];
  const input = x.map((xi, i) => [xi, data[i]]);
  let result;

  switch (type) {
    case 'linear':
      result = regression.linear(input);
      break;
    case 'quadratic':
      result = regression.polynomial(input, { order: 2 });
      break;
    case 'cubic':
      result = regression.polynomial(input, { order: 3 });
      break;
    case 'exponential':
      result = regression.exponential(input);
      break;
    case 'logarithmic':
      result = regression.logarithmic(input);
      break;
    default:
      result = regression.linear(input);
  }

  return result.string;
}