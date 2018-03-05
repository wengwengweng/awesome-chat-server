import React, { Component } from 'react';
import { Input, Card, Button } from 'antd';
// import api from '@client/utils/api'
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: 4,
      roomId: '1-4',
      otherSideId: 1,
      content: '',
      userName: '李若月'
    };
  }

  componentWillMount() {
    socket.emit('online', this.state.userId)
  }

  sendMessage = (data = {}) => {
    console.log(data)
    socket.emit('join', data.roomId, data.userId)
    socket.on('sys', (msg) => {
      console.log('get messsage:', msg)
    })
    socket.emit('message', data)
  }

  handleSubmit = () => {
    const {
      userId,
      roomId,
      otherSideId,
      content,
      userName,
    } = this.state;
    const data = {
      userId,
      roomId,
      otherSideId,
      content,
      userName,
      time: Date.parse(new Date())
    }
    this.sendMessage(data)
  }

  handleChangeState = (type, e) => {
    this.setState({
      [type]: e.target.value
    })
  }

  render() {
    const { userId, content, roomId, otherSideId, userName } = this.state;
    return (
      <div className="login">
        <h1>Test</h1>
        <div className="form-block">
          <Card>
            <Input onChange={this.handleChangeState.bind(this, 'roomId')} style={{ margin: '10px 0' }} value={roomId} placeholder="roomId" />
            <Input onChange={this.handleChangeState.bind(this, 'otherSideId')} style={{ margin: '10px 0' }} value={otherSideId} placeholder="otherSideId" />
            <Input onChange={this.handleChangeState.bind(this, 'userId')} style={{ margin: '10px 0' }} value={userId} placeholder="userId" />
            <Input onChange={this.handleChangeState.bind(this, 'userName')} style={{ margin: '10px 0' }} value={userName} placeholder="userName" />
            <Input onChange={this.handleChangeState.bind(this, 'content')} style={{ margin: '10px 0' }} value={content} placeholder="content" />
            <Button onClick={this.handleSubmit}>提交</Button>
          </Card>
        </div>
      </div>
    )
  }
}


export default Test;