def test_stats(client):

    response = client.get("/api/stats")

    assert response.status_code == 200

    data = response.get_json()

    assert "total_resumes" in data
    assert "avg_match_score" in data