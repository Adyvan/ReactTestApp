import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const XValue = 1;
const OValue = 4;

function Square(props) {
return (
  <button className="square" onClick={props.onClick}>
    {props.value === XValue ? "X" : props.value === OValue ? "0" : '' }
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

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber:0,
      xIsNext: true,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (!calculateFinishGame(squares, history.length) && !squares[i]) {
      squares[i] = this.state.xIsNext ? XValue : OValue;
      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      });
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateFinishGame(current.squares, history.length);
    
    let status = 'Следующий ход: ' + (this.props.xIsNext ? 'X' : '0');
    if (winner) {
      status = 'Выиграл ' + (winner === XValue ? 'X' : '0');
    }

    const moves = history.map((step, move) => {
      const desc = move 
      ? 'Перейти к ходу #' + move + ' ' + getLastPosition(history, move)
      : 'К началу игры';
        return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>  
        )
    });

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

function calculateFinishGame(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { won: squares[a] };
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
