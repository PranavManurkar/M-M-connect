import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom, Message, User
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room name from the URL
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_name}'

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender_username = text_data_json['sender']

        print("message", message)
        print("sender_username", sender_username)

        # Find or create the chat room
        room, created = await database_sync_to_async(ChatRoom.objects.get_or_create)(name=self.room_name)

        # Find the sender (user)
        sender = await database_sync_to_async(User.objects.get)(username=sender_username)

        # Save the message
        await database_sync_to_async(Message.objects.create)(
            room=room,  # Use the `room` instance, not the tuple
            sender=sender,
            content=message
        )

        # Broadcast the message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_username,
            }
        )


    async def chat_message(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
        }))

    def save_message(self, room, sender, message):
        """Helper function to save the message to the database."""
        Message.objects.create(
            room=room,
            sender=sender,
            content=message
        )
