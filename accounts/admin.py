from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Admin
)

@admin.register(Admin)
class AdminUserAdmin(UserAdmin):
    model = Admin
    list_display = ["username","full_name","email","is_active","last_login"]
    list_filter = ["is_active","is_staff"]
    search_fields = ["username","email","full_name"]
    ordering = ["username"]
    
    
    fieldsets = (
        (None,           {"fields": ("username", "password")}),
        ("Personal info",{"fields": ("full_name", "email")}),
        ("Permissions",  {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("username", "full_name", "email", "password1", "password2"),
        }),
    )