from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.utils.dateparse import parse_time 
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, AppointmentSerializer, MentorDetailsSerializer, ReviewSerializer, FavoriteSerializer, MessageSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from .models import *
from rest_framework.decorators import api_view
from django.conf import settings
from urllib.parse import urljoin



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = request.data.get('role')
            if role == "Mentor":
                MentorDetails.objects.create(
                    mentor=user,
                )
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailsView(APIView):
    def post(self, request):
        user = User.objects.filter(username=request.data.get('username'))
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserIDView(APIView):
    def post(self, request):
        #print(request)
        username = request.data.get('username')
        #print("blah blah: ", username)
        user = User.objects.get(username=username)
        id = user.id
        return Response({"id" : id}, status=status.HTTP_200_OK)

class MenteeAppointmentView(APIView):
    def get(self, request):
        mentee_id = request.user.id
        appointments = Appointment.objects.filter(mentee_id = request.user.id)
        serializer = AppointmentSerializer(appointments, many=True)
        appointment_details = []
        for appointment in serializer.data:
            #print("appointment: ", appointment)
            mentor_id = appointment['mentor_id']
            mentee_object = User.objects.get(id=mentee_id)
            mentor_object = User.objects.get(id=mentor_id)
            #print("mentor: ", mentor_id)
            mentor_details_object = MentorDetails.objects.get(mentor_id = mentor_id)
            mentor_details_serializer = MentorDetailsSerializer(mentor_details_object)
            mentor_details = mentor_details_serializer.data
            mentee_serializer = UserSerializer(mentee_object)
            mentor_serializer = UserSerializer(mentor_object)
            mentee = mentee_serializer.data
            mentor = mentor_serializer.data
            appointment_details.append({
                "id": appointment["appointment_id"],
                "mentorName": mentor["name"],
                "studentName":  mentee["name"],
                "start_time": appointment["start_time"],
                "end_time": appointment["end_time"],
                "topic": mentor_details["specialization"],
                "date": appointment["date"],
                "status": appointment["status"],
            })
        #print(appointment_details)
        return Response(appointment_details, status=status.HTTP_200_OK)
    
    def post(self, request):
        print(request.data)
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            # Extract start and end time from request data
            start_time = parse_time(request.data.get("start_time"))
            end_time = parse_time(request.data.get("end_time"))
            mentor_id = request.data.get("mentor_id")
            date = request.data.get("date")
            print(start_time, end_time, mentor_id)
            overlapping_appointments = Appointment.objects.filter(
                mentor_id=mentor_id,
                start_time__lt=end_time,  
                end_time__gt=start_time,
                date = date,
                status = "Confirmed"
            )

            if overlapping_appointments.exists():
                return Response(
                    {"error": "An overlapping appointment already exists."},
                    status=status.HTTP_406_NOT_ACCEPTABLE
                )

            # Save the appointment if no overlaps are found
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MentorAppointmentView(APIView):
    def get(self, request):
        mentor_id = request.user.id
        #print(mentor_id)
        appointments = Appointment.objects.filter(mentor_id = mentor_id)
        serializer = AppointmentSerializer(appointments, many=True)
        appointment_details = []
        for appointment in serializer.data:
            #print("appointment: ", appointment)
            mentee_id = appointment['mentee_id']
            mentee_object = User.objects.get(id=mentee_id)
            mentor_object = User.objects.get(id=mentor_id)
            #print("mentor: ", mentor_id)
            mentor_details_object = MentorDetails.objects.get(mentor_id = mentor_id)
            mentor_details_serializer = MentorDetailsSerializer(mentor_details_object)
            mentor_details = mentor_details_serializer.data
            mentee_serializer = UserSerializer(mentee_object)
            mentor_serializer = UserSerializer(mentor_object)
            mentee = mentee_serializer.data
            mentor = mentor_serializer.data
            appointment_details.append({
                "id": appointment["appointment_id"],
                "mentorName": mentor["name"],
                "studentName":  mentee["name"],
                "start_time": appointment["start_time"],
                "end_time": appointment["end_time"],
                "topic": mentor_details["specialization"],
                "date": appointment["date"],
                "status": appointment["status"],
            })
        #print(appointment_details)
        return Response(appointment_details, status=status.HTTP_200_OK)
    
    def post(self, request):
        print(request.data)
        appointment_id = request.data.get("id")
        status_update = request.data.get("status")
        
        if not appointment_id or not status_update:
            return Response(
                {"error": "Both 'id' and 'status' fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Retrieve the appointment
            appointment = Appointment.objects.get(appointment_id=appointment_id)
            print("boooo: ", appointment.status)
            # Update the status
            appointment.status = status_update
            appointment.save()

            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found or you do not have permission to update it."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MentorDetailsViewSet(ModelViewSet):
    queryset = MentorDetails.objects.all()
    serializer_class = MentorDetailsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # Enable partial updates
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        mentor = serializer.data
        id = mentor["mentor"]
        user_object = User.objects.get(id = id)
        user_serializser = UserSerializer(user_object)
        user = user_serializser.data
        data = {
            "name": user["name"],
            "username": user["username"],
            "college": mentor["college"],
            "specialization": mentor["specialization"],
            "avatar": mentor["avatar"],
            "description": mentor["description"],
        }
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        #print(serializer.data)
        mentor = serializer.data
        id = mentor["mentor"]
        user_object = User.objects.get(id = id)
        user_serializser = UserSerializer(user_object)
        user = user_serializser.data
        data = {
            "name": user["name"],
            "username": user["username"],
            "college": mentor["college"],
            "specialization": mentor["specialization"],
            "avatar": mentor["avatar"],
            "description": mentor["description"],
        }
        #print("hooollaaaaaaa: ", data)
        return Response(data)
    
class MentorReviewView(APIView):

    def get(self, request, mentor_id):
        reviews = Review.objects.filter(mentor_id=mentor_id)
        data = reviews.values('rating', 'comment')  
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, mentor_id):
        data = request.data
        data['mentor_id'] = mentor_id
        data['mentee_id'] = request.user.id  

        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, mentor_id):
        mentee_id = request.user.id  
        review = Review.objects.filter(mentor_id=mentor_id, mentee_id=mentee_id).first()

        if not review:
            return Response({"error": "Review not found or you are not authorized to delete it."}, status=status.HTTP_404_NOT_FOUND)

        review.delete()
        return Response({"message": "Review deleted successfully."}, status=status.HTTP_200_OK)

class FavoritesView(APIView):
    def get(self, request):
        favorites = Favorite.objects.filter(mentee_id=request.user.id)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, mentor_id):
        mentee_id = request.user.id
        data = {
            "mentee_id": mentee_id,
            "mentor_id": mentor_id
        }

        serializer = FavoriteSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, mentor_id):
        mentee_id = request.user.id
        favorite = Favorite.objects.filter(mentee_id=mentee_id, mentor_id=mentor_id).first()

        if not favorite:
            return Response(
                {"error": "Favorite not found or you are not authorized to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )

        favorite.delete()
        return Response({"message": "Favorite deleted successfully."}, status=status.HTTP_200_OK)



@api_view(['GET'])
def check_review(request, mentor_id):
    mentee_id = request.user.id
    review_exists = Review.objects.filter(mentor_id=mentor_id, mentee_id=mentee_id).exists()
    return Response({"exists": review_exists}, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_favorite(request, mentor_id):
    mentee_id = request.user.id
    favorite_exists = Favorite.objects.filter(mentor_id=mentor_id, mentee_id=mentee_id).exists()
    return Response({"exists": favorite_exists}, status=status.HTTP_200_OK)

@api_view(['GET'])
def favorite_mentor_details(request):
    mentee_id = request.user.id
    
    favorites = Favorite.objects.filter(mentee_id=mentee_id)
    serializer = FavoriteSerializer(favorites, many=True)
    #print(serializer.data)
    mentor_details = []
    for favorite in serializer.data:       
        mentor_id = favorite["mentor_id"]
        #print("mentor_id: ", mentor_id)
        user = User.objects.get(id=mentor_id)
        mentor_object = MentorDetails.objects.get(mentor_id=mentor_id)
        mentor_serializer = MentorDetailsSerializer(mentor_object)
        #print("mentor_serializer: ", mentor_serializer.data)
        mentor = mentor_serializer.data
        avatar_url = (
            urljoin(settings.MEDIA_URL, mentor["avatar"])
            if mentor["avatar"]
            else None
        )
        full_avatar_url = request.build_absolute_uri(avatar_url) if avatar_url else None
        mentor_details.append({
            "name": user.name,
            "username": user.username,
            "college": mentor["college"],
            "cumulative_rating": mentor["cumulative_rating"],
            "specialization": mentor["specialization"],
            "avatar": full_avatar_url,
        })
        #print(mentor_details)

    return Response(mentor_details, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_chat_history(request, room_name):
    try:
        room = ChatRoom.objects.get(name=room_name)
        messages = room.messages.order_by('timestamp').values('sender__username', 'content', 'timestamp')
        return JsonResponse(list(messages), safe=False)
    except ChatRoom.DoesNotExist:
        return JsonResponse([], safe=False)

@api_view(['GET'])   
def get_chat_details(request, room_id):
    appointment_object = Appointment.objects.get(appointment_id = room_id)
    serializer = AppointmentSerializer(appointment_object)
    appointment = serializer.data
    print(appointment)
    mentee_id = appointment["mentee_id"]
    mentor_id = appointment["mentor_id"]
    mentor_object = User.objects.get(id = mentor_id)
    mentor_serializer = UserSerializer(mentor_object)
    mentor = mentor_serializer.data
    mentee_object = User.objects.get(id = mentee_id)
    mentee_serializer = UserSerializer(mentee_object)
    mentee = mentee_serializer.data
    mentor_details_object = MentorDetails.objects.get(mentor_id = mentor_id)
    mentor_details_serializer = MentorDetailsSerializer(mentor_details_object)
    mentor_details = mentor_details_serializer.data
    avatar_url = (
            urljoin(settings.MEDIA_URL, mentor_details["avatar"])
            if mentor_details["avatar"]
            else None
        )
    full_avatar_url = request.build_absolute_uri(avatar_url) if avatar_url else None
    data = {
            "mentee_name": mentee["name"],
            "mentor_name": mentor["name"],
            "mentor_avatar": full_avatar_url,
            "topic": mentor_details["specialization"],
    }
    print(data)
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])   
def get_usernames(request, room_id):
    appointment_object = Appointment.objects.get(appointment_id = room_id)
    serializer = AppointmentSerializer(appointment_object)
    appointment = serializer.data
    mentee_id = appointment["mentee_id"]
    mentor_id = appointment["mentor_id"]
    mentor_object = User.objects.get(id = mentor_id)
    mentor_serializer = UserSerializer(mentor_object)
    mentor = mentor_serializer.data
    mentee_object = User.objects.get(id = mentee_id)
    mentee_serializer = UserSerializer(mentee_object)
    mentee = mentee_serializer.data
    data = {
            "mentee_username": mentee["username"],
            "mentor_username": mentor["username"],
    }
    print("googoogaagaa: ", data)
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])   
def get_mentor_list(request, specialization):
    if specialization == "all":
        mentor_details_object = MentorDetails.objects.all() 
    else:
        mentor_details_object = MentorDetails.objects.filter(specialization=specialization)
    serializer = MentorDetailsSerializer(mentor_details_object, many=True)
    mentor_details = []
    print(serializer.data)
    for mentor in serializer.data:       
        mentor_id = mentor["mentor"]
        user = User.objects.get(id=mentor_id)
        avatar_url = (
            urljoin(settings.MEDIA_URL, mentor["avatar"])
            if mentor["avatar"]
            else None
        )
        full_avatar_url = request.build_absolute_uri(avatar_url) if avatar_url else None
        mentor_details.append({
            "name": user.name,
            "username": user.username,
            "college": mentor["college"],
            "rating": mentor["cumulative_rating"],
            "specialization": mentor["specialization"],
            "avatar": full_avatar_url,
        })
    return Response(mentor_details, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_matching_appointments(request, mentor_id):
    mentee_id = request.user.id
    appointments = Appointment.objects.filter(mentee_id = request.user.id, mentor_id = mentor_id)
    serializer = AppointmentSerializer(appointments, many=True)
    appointment_details = []
    for appointment in serializer.data:
        print("appointment: ", appointment)
        mentor_id = appointment['mentor_id']
        mentee_object = User.objects.get(id=mentee_id)
        mentor_object = User.objects.get(id=mentor_id)
        print("mentor: ", mentor_id)
        mentor_details_object = MentorDetails.objects.get(mentor_id = mentor_id)
        mentor_details_serializer = MentorDetailsSerializer(mentor_details_object)
        mentor_details = mentor_details_serializer.data
        mentee_serializer = UserSerializer(mentee_object)
        mentor_serializer = UserSerializer(mentor_object)
        mentee = mentee_serializer.data
        mentor = mentor_serializer.data
        appointment_details.append({
            "id": appointment["appointment_id"],
            "mentorName": mentor["name"],
            "studentName":  mentee["name"],
            "start_time": appointment["start_time"],
            "end_time": appointment["end_time"],
            "topic": mentor_details["specialization"],
            "date": appointment["date"],
            "status": appointment["status"],
        })
    print(appointment_details)
    return Response(appointment_details, status=status.HTTP_200_OK)
