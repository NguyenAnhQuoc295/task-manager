"""
Tests for API endpoints.
These tests are run by GitHub Actions in the CI/CD pipeline.
"""

# pyrefly: ignore [missing-import]
import pytest
from django.test import Client


@pytest.fixture
def client():
    return Client()


class TestHealthCheck:
    """Test the health check endpoint used by CI/CD pipeline."""

    def test_health_returns_200(self, client):
        response = client.get("/api/health/")
        assert response.status_code == 200

    def test_health_returns_ok_status(self, client):
        response = client.get("/api/health/")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_contains_timestamp(self, client):
        response = client.get("/api/health/")
        data = response.json()
        assert "timestamp" in data

    def test_health_contains_service_name(self, client):
        response = client.get("/api/health/")
        data = response.json()
        assert data["service"] == "gk-web-backend"


class TestAPIRoot:
    """Test the API root endpoint."""

    def test_root_returns_200(self, client):
        response = client.get("/api/")
        assert response.status_code == 200

    def test_root_returns_version(self, client):
        response = client.get("/api/")
        data = response.json()
        assert data["version"] == "1.0.0"

    def test_root_lists_endpoints(self, client):
        response = client.get("/api/")
        data = response.json()
        assert "endpoints" in data
        assert "health" in data["endpoints"]


class TestTaskList:
    """Test the demo tasks endpoint."""

    def test_list_tasks_returns_200(self, client):
        response = client.get("/api/tasks/")
        assert response.status_code == 200

    def test_list_tasks_returns_count(self, client):
        response = client.get("/api/tasks/")
        data = response.json()
        assert data["count"] == 3

    def test_create_task_returns_201(self, client):
        response = client.post(
            "/api/tasks/",
            data={"title": "New Task"},
            content_type="application/json",
        )
        assert response.status_code == 201

    def test_create_task_returns_title(self, client):
        response = client.post(
            "/api/tasks/",
            data={"title": "New Task"},
            content_type="application/json",
        )
        data = response.json()
        assert data["title"] == "New Task"
        assert data["done"] is False

    def test_create_task_without_title_returns_400(self, client):
        response = client.post(
            "/api/tasks/",
            data={},
            content_type="application/json",
        )
        assert response.status_code == 400
