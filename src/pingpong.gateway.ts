import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

class Vector {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

interface IPlayer {
  color: string;
  isUp: boolean;
  isDown: boolean;
  isLeft: boolean;
  isRight: boolean;
  id: string;
  timeStamp: number;
  centerPos: Vector;
  velocity: Vector;
  radius: number;
}

interface PingDto {
  clientSendTimeStamp: number;
  clientReceiveTimeStamp: number;
  serverTimeStamp: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PingpongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  players: Map<string, IPlayer[]>;
  @SubscribeMessage('ping')
  handleMsgPing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PingDto,
  ) {
    data.serverTimeStamp = Date.now();
    client.emit('ping', data);
  }
  @SubscribeMessage('updateMe')
  handleMsgUpdateMe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: IPlayer,
  ) {
    this.players.get(client.id).push(data);
  }

  afterInit() {
    console.log('Gateway init!');
    this.players = new Map();
    setInterval(() => {
      const obj = new Object();
      this.players.forEach((value, key) => {
        const newPlayers: IPlayer[] = [];
        let size = value.length;
        while (size) {
          newPlayers.push(value.shift());
          --size;
        }
        obj[key] = newPlayers;
      });
      this.server.emit('playersInfo', obj);
    }, 100);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`client connected ${client.id}`);
    this.players.set(client.id, []);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`client disconnected ${client.id}`);
    client.broadcast.emit('deletePlayer', client.id);
    this.players.delete(client.id);
  }
}
