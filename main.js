$(document).ready(function() {
  let state = null; // Додаємо змінну для збереження стану алгоритму
  let intervalId = null; // Змінна для збереження інтервалу автоматичного виконання
  let logs = []; // Массив для збереження логів

  $('#addRowAbove').on('click', function() {
    var selectedRow = $('#myTable tbody tr.selected');
    var newRow = '<tr><td></td><td contenteditable="true"></td><td><i class="fa fa-arrow-right" aria-hidden="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>';
    if (selectedRow.length) {
        selectedRow.before(newRow);
    }
    updateRowNumbers();
});

$('#addRowBelow').on('click', function() {
    var selectedRow = $('#myTable tbody tr.selected');
    var newRow = '<tr><td></td><td contenteditable="true"></td><td><i class="fa fa-arrow-right" aria-hidden="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>';
    if (selectedRow.length) {
        selectedRow.after(newRow);
    }
    updateRowNumbers();
});

$('#deleteRow').on('click', function() {
  var selectedRow = $('#myTable tbody .selected');
  var rowCount = $('#myTable tbody tr').length;
  if (selectedRow.length) {
      if (rowCount > 1) {
          selectedRow.remove();
          updateRowNumbers();
      }
  }
});

  $('#moveUp').on('click', function() {
    var selectedRow = $('#myTable tbody .selected');
    if (selectedRow.prev().length && selectedRow.length) {
      selectedRow.insertBefore(selectedRow.prev());
      updateRowNumbers();
    }
  });

  $('#moveDown').on('click', function() {
    var selectedRow = $('#myTable tbody .selected');
    if (selectedRow.next().length && selectedRow.length) {
      selectedRow.insertAfter(selectedRow.next());
      updateRowNumbers();
    }
  });

  $('#myTable tbody').on('click', 'tr', function() {
    $(this).addClass('selected').siblings().removeClass('selected');
    $('#moveUp').prop('disabled', $('#myTable tbody tr:first').hasClass('selected'));
    $('#moveDown').prop('disabled', $('#myTable tbody tr:last').hasClass('selected'));
});

  $('#stepButton').on('click', function() {
    stepAlgorithm();
  });

  $('#startButton').on('click', function() {
    const rules = getRulesFromTable();
    let word = $('#workRow').val();
    state = null; // Скидаємо стан перед повним виконанням
    logs = []; // Скидаємо логи
    const maxIterations = getMaxIterations();
    let result;
    do {
      result = markovAlgorithmStep(rules, word, state, maxIterations);
      logStep(result, word, rules); // Логування кожного кроку
      word = result.word;
      state = result.done ? null : result;
    } while (!result.done);
    $('#workRow').val(result.word);

    // Видаляємо підсвічування після завершення
    $('#myTable tbody tr').removeClass('highlight');
    displayLogs();
  });

  $('#clearButton').on('click', function() {
    $('#workRow').val('');
    state = null; // Скидаємо стан при очищенні
    $('#myTable tbody tr').removeClass('highlight'); // Видаляємо підсвічування
    logs = []; // Скидаємо логи
    displayLogs();
  });

  $('#playButton').on('click', function() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      $('#playButton i').removeClass('fa-pause').addClass('fa-play');
    } else {
      $('#playButton i').removeClass('fa-play').addClass('fa-pause');
      const speed = getSpeed();
      intervalId = setInterval(stepAlgorithm, speed);
    }
  });

  $('#speedRange').on('input', function() {
    if (intervalId) {
      clearInterval(intervalId);
      const speed = getSpeed();
      intervalId = setInterval(stepAlgorithm, speed);
    }
  });

  $('#exportButton').on('click', function() {
    const rules = getRulesFromTable();
    const word = $('#workRow').val();
    const data = {
      rules: rules,
      word: word
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "markov_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  $('#importButton').on('click', function() {
    $('#importFile').click();
  });

  $('#importFile').on('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const contents = e.target.result;
        const data = JSON.parse(contents);
        loadTableData(data.rules);
        $('#workRow').val(data.word);
      };
      reader.readAsText(file);
    }
  });

  $('#logButton').on('click', function() {
    $('#logContainer').toggle();
  });

  function loadTableData(rules) {
    const tbody = $('#myTable tbody');
    tbody.empty();
    for (let i = 0; i < rules.sample.length; i++) {
      const row = `<tr>
        <td>${i + 1}</td>
        <td contenteditable="true">${rules.sample[i]}</td>
        <td><i class="fa fa-arrow-right" aria-hidden="true"></td>
        <td contenteditable="true">${rules.substitution[i]}</td>
        <td contenteditable="true"></td>
      </tr>`;
      tbody.append(row);
    }
  }

  function stepAlgorithm() {
    const rules = getRulesFromTable();
    const word = $('#workRow').val();
    const maxIterations = getMaxIterations();
    const result = markovAlgorithmStep(rules, word, state, maxIterations);
    logStep(result, word, rules); // Логування кожного кроку
    $('#workRow').val(result.word);
    state = result.done ? null : result; // Оновлюємо стан або скидаємо, якщо виконано

    // Підсвічуємо рядок з застосованим правилом
    $('#myTable tbody tr').removeClass('highlight');
    if (result.appliedRuleIndex !== -1) {
      $('#myTable tbody tr').eq(result.appliedRuleIndex).addClass('highlight');
    }

    if (result.done) {
      clearInterval(intervalId);
      intervalId = null;
      $('#playButton i').removeClass('fa-pause').addClass('fa-play');
      setTimeout(() => {
        alert("Робота завершена");
      }, 0);
    }
  }

  function getSpeed() {
    const maxSpeed = 100; // Мінімальний інтервал у мілісекундах
    const minSpeed = 2000; // Максимальний інтервал у мілісекундах
    const speedRangeValue = $('#speedRange').val();
    return minSpeed - ((speedRangeValue - 100) * (minSpeed - maxSpeed) / (2000 - 100));
  }

  function getMaxIterations() {
    if ($('#iterationSelect').val() === 'unlimited') {
      return Infinity;
    } else {
      return parseInt($('#iterationSelect').val(), 10);
    }
  }

  function updateRowNumbers() {
    $('#myTable tbody tr').each(function(index) {
        $(this).find('td:first').text(index + 1);
    });
}

  function logStep(result, previousWord, rules) {
    const logEntry = {};
    logEntry.iteration = result.count.applied;
    logEntry.ruleIndex = result.appliedRuleIndex + 1;
    logEntry.rule = `${rules.sample[result.appliedRuleIndex]} -> ${rules.substitution[result.appliedRuleIndex]}`;
    logEntry.beforeWord = previousWord;
    logEntry.afterWord = result.word;

    // Визначення змінених символів
    const ai = rules.sample[result.appliedRuleIndex];
    const bi = rules.substitution[result.appliedRuleIndex];
    const index = previousWord.indexOf(ai);
    const beforeHighlight = previousWord.slice(0, index) + 
                            previousWord.slice(index, index + ai.length).split('').map(char => `<span class="changed">${char}</span>`).join('') + 
                            previousWord.slice(index + ai.length);
    const afterHighlight = previousWord.slice(0, index) + 
                           bi.split('').map(char => `<span class="changed">${char}</span>`).join('') + 
                           previousWord.slice(index + ai.length);

    logEntry.diff = `${beforeHighlight} -> ${afterHighlight}`;

    logs.push(logEntry);
    displayLogs();
  }

  function displayLogs() {
    const logContainer = $('#logContent');
    logContainer.empty();
    logs.forEach(log => {
      logContainer.append(`<p>${log.iteration}) ${log.ruleIndex}: ${log.rule}\n\t${log.diff}</p>`);
    });
  }

  window.getRulesFromTable = function() {
    const rules = { sample: [], substitution: [] };
    $('#myTable tbody tr').each(function(index) {
      const sample_1 = $(this).find('td:nth-child(2)').text().trim();
      const substitution_1 = $(this).find('td:nth-child(4)').text().trim();
      rules.sample.push(sample_1);
      rules.substitution.push(substitution_1);
    });
    return rules;
  }
});