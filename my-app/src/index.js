import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const XValue = 1;
const OValue = 4;
const Lines = [
  [0, 4, 8], // 0
  [2, 4, 6], // 1
  [0, 1, 2], // 2
  [3, 4, 5], // 3
  [6, 7, 8], // 4
  [0, 3, 6], // 5
  [1, 4, 7], // 6
  [2, 5, 8], // 7
];

const positionLines = [
  [0,2,5],  //0
  [6,2],    //1
  [1,2,7],  //2
  [3,5],    //3
  [0,1,3,6],//4
  [3,7],    //5
  [1,4,5],  //6
  [4,6],    //7
  [0,4,7],  //8   
];

function Square(props) {
  const className = ((props.value && props.value.isWin) ? "square-win" : "square");
  return (
    <button className={className} onClick={props.onClick}>
      {props.value && (props.value.value === XValue) ? "X" : props.value && (props.value.value === OValue) ? "0" : '' }
    </button>
  );
  }

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={()=> this.props.onClick(i)}
      />
    );
  }

  renderLine(i) {
    let elements = Array(3);
    for(let row = 0; row < 3; row++)
    {
      elements.push(this.renderSquare(i * 3 + row));
    }
    return (
      <div className="board-row">
        {elements}
      </div>
    );
  }

  render() {
    let elements = Array(3);
    for(let line = 0; line < 3; line++)
    {
      elements.push(this.renderLine(line));
    }
    return (
      <div className='board'>
        {elements}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const firstStep = getRandomBool();
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber:0,
      xIsNext: firstStep,
      orderInverse: false,
      firstStep: firstStep,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: ((step % 2) === 0) ?  this.state.firstStep : !this.state.firstStep,
    });
  }

  botStep(squares) {
    let gradeMask = Array(9).fill(null);
    let index = calculateNextStep(squares, gradeMask);
    if(index !== null) {
      this.handleClick(index);
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (!calculateFinishGame(squares, history.length) && ! squares[i]) {
      if(!squares[i]){
        squares[i] = {
           value: null,
           isWin: false,
          };
       }
      squares[i].value = this.state.xIsNext ? XValue : OValue;

      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }
  }
  
  onValueChange = (event) => {
    this.setState({
      orderInverse: !this.state.orderInverse,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateFinishGame(current.squares, history.length);
    let canGoBot = true;

    let status = 'Следующий ход: ' + (this.state.xIsNext ? 'X' : '0');
    if (winner) {
      status = 'Выиграл ' + (winner.won === XValue ? 'X' : '0');
      canGoBot = false;
    } else if(this.state.stepNumber === 9) {
      status = 'Ничья'
      canGoBot =false;
    }

    
    let moves = history.map((step, move) => {
      const desc = move 
      ? 'Перейти к ходу #' + move + ' ' + getLastPosition(history, move)
      : 'К началу игры';
      const className = (move === this.state.stepNumber ? "btn-select" : "none");
        return (
        <li key={move} >
          <button className={className} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>  
        )
    });

    if(this.state.orderInverse) {
      moves = moves.reverse(); 
    }

    if(!this.state.xIsNext && canGoBot)
    {
      setTimeout(() => {this.botStep(current.squares)},200);
    }

    return (
      <div className="game">
        <div className="game-board">
        <Board
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
        />
        </div>
        <div className="game-info">
          <div>{status}</div>
            <div>
              <input
                type="checkbox"
                value="inverse"
                checked={this.state.orderInverse}
                onChange={this.onValueChange}
              />
            Inverse Order
            </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateNextStep(squares) {
  var prioritySquares = squares.slice().map((x,i) => { return {
    grade: gratePosition(i, squares),
    index: i,
  }}).sort((a,b) => {
    if (a.grade > b.grade) return -1;
    if (a.grade < b.grade) return 1;
    return 0;
  })

  let prioritySquare = prioritySquares.slice().shift();
  return prioritySquare.index === -1 ? null : prioritySquare.index;
}

function gratePosition(x, squares)
{
  if(squares[x]?.value)
  {
    return -1;
  }
  let lineGarateSumm = gratePositionByLines(x, squares).reduce((p,c) => p * c);
  return lineGarateSumm;
}

function gratePositionByLines(x, squares)
{
  let value = positionLines[x].map((line, i) => lineGrateValue(x, line, squares));
  return value;
}

function allValueLines(squares)
{
  let lines = Array(Lines.length).fill(0);
  for (let index = 0; index < Lines.length; index++) {
    lines[index] = Lines[index].map((x)=> (squares[x]?.value ?? 0)).reduce((p,c) => p + c);
  }
  return lines;
}

function lineGrateValue(squareTargetIndex, lineIndex, squares)
{
  let summ = 0;
  let emptyIndex = -1
  for (let i = 0; i < Lines[lineIndex].length; i++) {
    const squareIndex = Lines[lineIndex][i];
    const value = squares[squareIndex];
    if(value) {
      summ += value.value;
    } else if(squareIndex !== squareTargetIndex) {
      emptyIndex = i;
    }
  }

  const grade = [1, 2, 4, 8, 18, 32];
  
  let value = grade[0];

  switch (summ) {
    case 8: // 0 0 []
    value = grade[5]
      break;
    case 2: // X X []
      value = grade[4]
      break;
    case 4: // 0 [] []
      value = grade[3];
      if(emptyIndex !== -1) {
        let linesValues = checkNext2Steps(squares, Lines[lineIndex][emptyIndex], squareTargetIndex)
        if(1 < countInArray(linesValues, (x)=> x === 2)) // lose case on next 2 step
        {
          value = 0;
        }
      }
      break;
    case 0: // [] [] []
      value = grade[2];
      break;
    case 1: // X [] []
      value = grade[1];
      break;
    default: 
      value = grade[0];
  }
  const linesValues = checkNextStep(squares, squareTargetIndex);
  if(1 < countInArray(linesValues, (x)=> x === 8))
  {
    value++;
  }

  return value;
}

function checkNext2Steps(oldSquares, NewXpos, NewOpos)
{
  var sCopy = oldSquares.slice();
  sCopy[NewXpos] = {
    value: XValue,
    isWin: false,
  };
  sCopy[NewOpos] = {
    value: OValue,
    isWin: false,
  };
  const linesValues = allValueLines(sCopy);
  return linesValues;
}

function checkNextStep(oldSquares, NewOpos)
{
  var sCopy = oldSquares.slice();
  sCopy[NewOpos] = {
    value: OValue,
    isWin: false,
  };
  const linesValues = allValueLines(sCopy);
  return linesValues;
}

function gradeIndex(line, squares)
{
  let index = line.map((x, i) => { return {
    index: x,
    grade: (!(squares[x]?.value) ? gratePosition(x) : -1),
  }}).sort((a,b) => {
    if (a.grade > b.grade) return -1;
    if (a.grade < b.grade) return 1;
    return 0;
  }).shift();
  return index?.index;
}

function calculateFinishGame(squares) {
  for (let i = 0; i < Lines.length; i++) {
    const [a, b, c] = Lines[i];
    if (squares[a] && squares[a].value 
      && squares[b] && squares[b].value
      && squares[c] && squares[c].value
      && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {
        squares[a] = Object.create(squares[a]);
        squares[b] = Object.create(squares[b]);
        squares[c] = Object.create(squares[c]);
      squares[a].isWin = true;
      squares[b].isWin = true;
      squares[c].isWin = true;

      return { won: squares[a].value };
    }
  }
  return null;
}

function getLastPosition(history, move)
{
  if(!move || move > history.length)
  {
    return null;
  }
  const previus = history[move - 1].squares.slice();
  const current = history[move].squares.slice();
  let index = 0;
  for (let i = 0; i < previus.length; i++) {
    if(previus[i] !== current[i])
    {
      index = i;
      break;
    }
  }
  return '('+ (Math.floor(index / 3) + 1) +','+ (index % 3 + 1) +')';
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomBool() {
  return Math.random() > 0.5;
}


function countInArray(array, func)
{
  let count = 0;
  for (let index = 0; index < array.length; index++) {
    if(func(array[index])){
      count++
    }
  }
  return count;
}