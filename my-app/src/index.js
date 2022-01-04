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
const LoseCase1TargetLines = [3,6];
const LoseCase1 = {x : 90000, o: 200};

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
        squares: Array(9).fill(null),
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
    let index = calculateNextStep(squares);
    if(index !== null) {
      this.handleClick(index);
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (!calculateFinishGame(squares, history.length) && !squares[i]) {
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

function gratePosition(x)
{
  let cleverStep = !debilFactor(0.618);
  return ((x % 2 === 0) && cleverStep ? ((x === 4) && cleverStep ? 4 : 3) : 2);
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

function gradeLine(squares, lines)
{
  let gameState = calculateStatePlayerS(squares);
  console.log(gameState);

  let cleverStep = !debilFactor(0.618);

  if(JSON.stringify(gameState) === JSON.stringify(LoseCase1) && cleverStep)
  {
    return LoseCase1TargetLines[getRandomInt(0,LoseCase1TargetLines.length)];
  }

  let linesValue = lines.map((x, i) => {
    const [a, b, c]  = lines[i];
    let aV = squares[a]?.value ?? 0;
    let bV = squares[b]?.value ?? 0;
    let cV = squares[c]?.value ?? 0;
    return { 
      value: aV + bV + cV,
      index: i
    };
  });

  // 0 0 []
  let priorityLine = linesValue.slice().filter((x) => x.value === 8).shift();

  if(!priorityLine)
  {
    // X X []
    priorityLine = linesValue.slice().filter((x) => x.value === 2).shift();
  }

  if(!priorityLine && !cleverStep)
  {
    priorityLine = linesValue.slice().filter((x) => x.value !== 3 && x.value !== 6 && x.value !== 9 && x.value !== 12).sort((a,b) => {
      if (a.index > b.index && debilFactor(0.618)) return -1;
      if (a.index < b.index && debilFactor(0.618)) return 1;
      return 0;
    }).shift();
    console.log('DebilLine is ' + JSON.stringify(priorityLine))
  }

  if(!priorityLine)
  {
    // 0 [] []
    priorityLine = linesValue.slice().filter((x) => x.value === 4).shift();
  }

  if(!priorityLine)
  {
    // [] [] []
    priorityLine = linesValue.slice().filter((x) => x.value === 0).shift();
  }

  if(!priorityLine)
  {
    // X [] []
    priorityLine = linesValue.slice().filter((x) => x.value === 1).shift();
  }

  if(!priorityLine)
  {
    // X 0 []
    priorityLine = linesValue.slice().filter((x) => x.value === 5).shift();
  }

  return  priorityLine?.index;
}

function calculateStatePlayerS(squares)
{
  let countX = 0;
  let count0 = 0;
  let valueX = 0;
  let value0 = 0;
  for (let i = 0; i < squares.length; i++) {
    if(squares[i]?.value)
    {
      if(squares[i]?.value=== XValue)
      {
        countX++;
        valueX += gratePosition(i) * (i + 1) * 10;
      } else if(squares[i]?.value=== OValue)
      {
        count0++;
        value0 += gratePosition(i) * (i + 1) * 10;
      }
    }
  }
  return {
    x: Math.pow(valueX, countX),
    o: Math.pow(value0, count0),
  };
}

function calculateNextStep(squares) {
  let priorityLine = gradeLine(squares, Lines);

  let line = Lines[priorityLine];
  let index = null;
  if(line) {
    index =  gradeIndex(line, squares);
  }
  return index === -1 ? null : index;
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


function debilFactor(factor)
{
  return Math.random() < factor ;
}