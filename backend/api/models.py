from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, role, name=None, password=None):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            name=name,
            role=role,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, role, name=None, password=None):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email,
            password=password,
            username=username,
            name=name,
            role=role,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )
    username = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=100, null=True)
    role = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "role"]

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

class Appointment(models.Model):
    appointment_id = models.AutoField(primary_key=True)  
    mentee_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentee")  
    mentor_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentor")  
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    status = models.CharField(max_length=100, null=True, default="Pending")

class MentorDetails(models.Model):
    mentor = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True) 
    avatar = models.ImageField(upload_to="profile_pics/", default="profile_pics/default_pp.jpg")
    specialization = models.TextField(default="Your Specialization")
    cumulative_rating = models.DecimalField(decimal_places=1, max_digits=3, default=0)
    college = models.TextField(default="Your college")
    description = models.TextField(default="Your description")

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    mentee_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentee_review")  
    mentor_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentor_review")
    rating = models.IntegerField()
    comment = models.TextField()

class Favorite(models.Model):
    favorite_id = models.AutoField(primary_key=True)
    mentee_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentee_fav")  
    mentor_id = models.ForeignKey(User, on_delete=models.CASCADE, to_field="id", related_name="mentor_fav")

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, unique=True)

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)