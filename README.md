
# Markov Emulator

This project is a Markov Normal Algorithms (MNA) emulator that allows users to execute and visualize the process of string transformation using substitution rules. MNA was proposed by Soviet mathematician Andrey Markov in the 1940s and is a formal system for string transformation.

## Features

- Input the initial working string and substitution rules.
- Step-by-step execution or full execution until completion.
- Setting the maximum number of iterations and execution speed.
- Logging of each step of the algorithm execution.
- Complexity graph visualization.

## Project Structure

- `index.html` - The main page of the application with an interface for input and control of the algorithm.
- `theory.html` - A page with theoretical information about MNA.
- `styles.css` - Styles for the pages.
- `main.js` - The main script that manages the application logic.
- `markovAlgorithm.js` - The implementation of Markov Normal Algorithms.
- `graph.js` - The script for building complexity graphs.
- Example JSON files with substitution rules:
  - `double_x.json`
  - `revers_ab.json`
  - `sub_unari.json`
  - `swap_first0_last1.json`
  - `double_10.json`

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/NickYurchak/markov-emulator.git
   ```

2. Navigate to the project directory:
   ```sh
   cd markov-emulator
   ```

3. Open the `index.html` file in your browser to run the application.

## Usage

1. Enter the initial working string in the "Робочий рядок" field.
2. Enter the substitution rules in the table.
3. Click the "Запустити алгоритм" button to start the algorithm execution.
4. Use the control buttons for step-by-step execution or complete processing until the end.
5. Adjust the execution speed and the maximum number of iterations as needed.
6. Export or import data using the respective buttons.

## Examples

You can use the following examples for testing the emulator:

- [Binary word duplication](https://github.com/NickYurchak/markov-emulator/blob/main/Examples/double_10.json)
- [Word duplication in alphabet x](https://github.com/NickYurchak/markov-emulator/blob/main/Examples/double_x.json)
- [Reverse a word in alphabet ab](https://github.com/NickYurchak/markov-emulator/blob/main/Examples/revers_ab.json)
- [Subtraction of unary number](https://github.com/NickYurchak/markov-emulator/blob/main/Examples/sub_unari.json)
- [Swap first zero and last one](https://github.com/NickYurchak/markov-emulator/blob/main/Examples/swap_first0_last1.json)
- [Download all examples (archive)](https://github.com/NickYurchak/markov-emulator/raw/main/Examples/examples.zip)

## Authors

- **Nick Yurchak** - [NickYurchak](https://github.com/NickYurchak)
