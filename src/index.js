import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var socket;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square key={i} value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)} />;
  }

  render() {

    const rows = [];

    for (let j = 0; j < 3; j++) {
      const row = [];
      for (let i = 0; i < 3; i++) {
        row.push(this.renderSquare(i + (3 * j)));
      }
      rows.push(<div key={j} className="board-row">{row}</div>);
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      role: null,
      xIsNext: false,
      allPlayersReady: false,
    };

    this.connectToGameServer = this.connectToGameServer.bind(this);
    this.isMyTurn = this.isMyTurn.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.connectToGameServer();
  }

  connectToGameServer() {
    socket = new WebSocket("ws://localhost:8080");

    // Connection opened
    socket.addEventListener('message', (message) => {
      let st = JSON.parse(message.data);
      this.setState({
        squares: st.squares,
        role: st.role,
        xIsNext: st.xIsNext,
        allPlayersReady: st.allPlayersReady,
      });
    });

  }

  isMyTurn(){
    return (this.state.role === 'X' && this.state.xIsNext) 
    || (this.state.role === 'O' && !this.state.xIsNext);
  }

  handleClick(i) {
    const squares = this.state.squares;

    if (calclulateWinner(squares) || squares[i] || this.isMyTurn()) {
      return;
    }

    socket.send(JSON.stringify({ sI : i }));
  }

  render() {

    const squares = this.state.squares;
    const winner = calclulateWinner(squares);
    const allPlayersReady = this.state.allPlayersReady;

    let status;
    if (winner) {
      status = "Der Gewinner ist " + winner;
    } else {
      status = 'Nächster Spieler: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    let whoAmI = this.state.role;

    if (allPlayersReady) {
      return (
        <div className="game" >
          <div className="game-board">
            <Board squares={squares} onClick={(i) => this.handleClick(i)} />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <div>Du bist {whoAmI}</div>
          </div>
        </div >
      );
    } else {
      return (
        <p>Warten auf Spieler...</p>
      );
    }


  }
}

function calclulateWinner(squares) {
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
      return squares[a];
    }
  }

  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
