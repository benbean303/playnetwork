# API Documentation

# Server


### <a href='./server/PlayNetwork.md'>PlayNetwork</a>  
Main interface of PlayNetwork, which acts as a composer for [WorkerNode](./server/WorkerNode.md)s. It handles socket connections, and then routes them to the right `Node` based on message scope.

### <a href='./server/Client.md'>Client</a>  
Client interface which is created for each individual connection. It can be connected to multiple [WorkerNode](./server/WorkerNode.md)s, and represents a single `User`.

### <a href='./server/WorkerNode.md'>WorkerNode</a>  
Each [WorkerNode](./server/WorkerNode.md) is a worker, running in own process, [PlayNetwork](./server/PlayNetwork.md) creates multiple [WorkerNode](./server/WorkerNode.md)s to utilize all available CPUs of a server. And contains routing information for network messages, and a channel for a communication to `Node` process.




# Node


### <a href='./node/Node.md'>Node</a>  
Each `WorkerNode` creates a worker process and instantiates a [Node](./node/Node.md), which is running in own thread on a single core. `PlayNetwork` creates multiple `WorkerNode`s to utilize all available CPUs of a server. [Node](./node/Node.md) handles multiple [User](./node/User.md)s and [Room](./node/Room.md)s.

### <a href='./node/Player.md'>Player</a>  
Player is created for each pair of a [User](./node/User.md) and a [Room](./node/Room.md) to which [User](./node/User.md) has joined. So [User](./node/User.md) will have as many [Player](./node/Player.md)s as many [Room](./node/Room.md)s it has joined.

### <a href='./node/Room.md'>Room</a>  
A Room represents own PlayCanvas [pc.Application] context, with a list of joined [Player](./node/Player.md)s.

### <a href='./node/Rooms.md'>Rooms</a>  
Interface with a list of all [Node](./node/Node.md) [Room](./node/Room.md)s. Client can send a room creation and join request, it is up to application logic to handle those requests and call create/join.

### <a href='./node/User.md'>User</a>  
User interface which is created for each individual connection from `PlayNetwork` to a [Node](./node/Node.md). User can join multiple rooms, and will have unique [Player](./node/Player.md) per room.

### <a href='./node/Users.md'>Users</a>  
Interface of all [User](./node/User.md)s, currently connected to a [Node](./node/Node.md). It provides events when users are connected and disconnected.

### <a href='./node/NetworkEntity.md'>NetworkEntity</a>  
NetworkEntity is a [pc.ScriptType], which is attached to a [pc.ScriptComponent] of an [pc.Entity] that needs to be synchronised between server and clients. It has unique ID, optional owner and list of properties to be synchronised.




# Client


### <a href='./client/PlayNetwork.md'>PlayNetwork</a>  
Main interface to connect to a server and interact with networked data.

### <a href='./client/InterpolateValue.md'>InterpolateValue</a>  
Helper class to interpolate values between states. It has mechanics to smoothen unreliable intervals of state and can interpolate simple values such as `number`, as well as complex: [pc.Vec2], [pc.Vec3], [pc.Vec4], [pc.Quat], [pc.Color].

### <a href='./client/Levels.md'>Levels</a>  
Interface that allows to save hierarchy data to a server.

### <a href='./client/Player.md'>Player</a>  
Player represents a pair of joined a [User](./client/User.md) and [Room](./client/Room.md). So each [User](./client/User.md) has as many [Player](./client/Player.md)s as rooms [Room](./client/Room.md)s it has joined.

### <a href='./client/Room.md'>Room</a>  
Room to which [User](./client/User.md) has joined.

### <a href='./client/Rooms.md'>Rooms</a>  
Interface to get [Room](./client/Room.md)s as well as request a [Room](./client/Room.md) create, join and leave.

### <a href='./client/User.md'>User</a>  
User object that is created for each [User](./client/User.md) we know, including ourself.

### <a href='./client/Users.md'>Users</a>  
Interface to access all known [User](./client/User.md)s as well as own user (`me`).



[pc.Vec2]: https://developer.playcanvas.com/en/api/pc.Vec2.html  
[pc.Vec3]: https://developer.playcanvas.com/en/api/pc.Vec3.html  
[pc.Vec4]: https://developer.playcanvas.com/en/api/pc.Vec4.html  
[pc.Quat]: https://developer.playcanvas.com/en/api/pc.Quat.html  
[pc.Color]: https://developer.playcanvas.com/en/api/pc.Color.html  
[pc.Application]: https://developer.playcanvas.com/en/api/pc.Application.html  
[pc.ScriptType]: https://developer.playcanvas.com/en/api/pc.ScriptType.html  
[pc.ScriptComponent]: https://developer.playcanvas.com/en/api/pc.ScriptComponent.html  
[pc.Entity]: https://developer.playcanvas.com/en/api/pc.Entity.html  