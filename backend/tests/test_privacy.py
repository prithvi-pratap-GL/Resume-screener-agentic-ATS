from services.privacy import scrub_pii


def test_email_masking():

    text = "Contact me at " "john@gmail.com"

    result = scrub_pii(text)

    assert "<EMAIL_ADDRESS>" in result


def test_phone_masking():

    text = "Phone 9876543210"

    result = scrub_pii(text)

    assert "<PHONE_NUMBER>" in result


def test_dates_not_masked():

    text = "Worked from " "2019 to 2022"

    result = scrub_pii(text)

    assert "2019" in result
