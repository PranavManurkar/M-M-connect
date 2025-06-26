from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances are provided by Django automatically
    list_display = ('email', 'username', 'name', 'role', 'is_admin', 'is_active')  # Fields to display in admin list view
    list_filter = ('is_admin', 'role', 'is_active')  # Filters for the sidebar
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'name', 'role')}),
        ('Permissions', {'fields': ('is_admin', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'name', 'role', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'username', 'role')  # Fields to search in admin
    ordering = ('email',)  # Default ordering
    filter_horizontal = ()

# Register the User model with the custom UserAdmin
admin.site.register(User, UserAdmin)
admin.site.register(Appointment)
admin.site.register(Message)
admin.site.register(ChatRoom)
