def test_create_and_list(client):
    r = client.post("/api/jobs",
                    data={"book_type": "text", "skill_name": "my-skill"},
                    files={"file": ("book.pdf", b"%PDF-1.4 fake", "application/pdf")})
    assert r.status_code == 201
    jid = r.json()["id"]
    assert client.get("/api/jobs").json()[0]["id"] == jid
    assert client.get(f"/api/jobs/{jid}").json()["status"] == "queued"

def test_create_rejects_bad_book_type(client):
    r = client.post("/api/jobs", data={"book_type": "bogus"},
                    files={"file": ("b.pdf", b"x", "application/pdf")})
    assert r.status_code == 422

def test_get_missing_404(client):
    assert client.get("/api/jobs/nope").status_code == 404

def test_delete(client):
    jid = client.post("/api/jobs", data={"book_type": "text"},
                      files={"file": ("b.pdf", b"x", "application/pdf")}).json()["id"]
    assert client.delete(f"/api/jobs/{jid}").status_code == 204
    assert client.get(f"/api/jobs/{jid}").status_code == 404
