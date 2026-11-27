import hashlib

import pytest

from app.services.upload_service import ALLOWED_FORMATS, sign_params

URL = "/api/uploads/image-signature"
CLOUDINARY_URL = "cloudinary://123456789012345:s3cr3t-Value_x@Planit-Cloud"


def test_signing_matches_cloudinarys_documented_example():
    params = {"eager": "w_400,h_300,c_pad|w_260,h_200,c_crop", "public_id": "sample_image", "timestamp": "1315060510"}

    assert sign_params(params, "abcd") == "bfd09f95f331f558cbd1320e67aa8d488770583e"


def test_signing_an_upload_needs_a_login(client):
    assert client.post(URL).status_code == 401


def test_signing_an_upload_needs_an_admin(client, reader_headers):
    assert client.post(URL, headers=reader_headers).status_code == 403


def test_without_cloudinary_the_admin_is_told_to_paste_a_link(client, admin_headers):
    response = client.post(URL, headers=admin_headers)

    assert response.status_code == 503
    assert "Paste a link" in response.get_json()["message"]


@pytest.mark.config(CLOUDINARY_URL=CLOUDINARY_URL, CLOUDINARY_FOLDER="planit")
def test_the_admin_gets_a_signed_upload(client, admin_headers):
    response = client.post(URL, headers=admin_headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    # The cloud name keeps its case.
    assert data["upload_url"] == "https://api.cloudinary.com/v1_1/Planit-Cloud/image/upload"
    fields = data["fields"]
    assert fields["api_key"] == "123456789012345"
    assert fields["folder"] == "planit"
    assert fields["allowed_formats"] == ALLOWED_FORMATS
    assert "svg" not in fields["allowed_formats"]
    expected = f"allowed_formats={ALLOWED_FORMATS}&folder=planit&timestamp={fields['timestamp']}s3cr3t-Value_x"
    assert fields["signature"] == hashlib.sha1(expected.encode()).hexdigest()
    # The secret itself never leaves the server.
    assert "s3cr3t-Value_x" not in response.get_data(as_text=True)


@pytest.mark.config(CLOUDINARY_URL="https://not-a-cloudinary-url.example.com")
def test_a_malformed_cloudinary_url_counts_as_not_set_up(client, admin_headers):
    assert client.post(URL, headers=admin_headers).status_code == 503
