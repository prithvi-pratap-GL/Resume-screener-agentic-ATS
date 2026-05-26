from services.llm import judge_and_revise


def test_judge_accepts_good_text(monkeypatch):

    calls = iter(['{"approved": true}'])

    def fake_chat(*args, **kwargs):
        return next(calls)

    monkeypatch.setattr("services.llm._chat", fake_chat)

    result = judge_and_revise("Professional recruiter summary", "summary")

    assert result == "Professional recruiter summary"


def test_judge_rewrites_bad_text(monkeypatch):

    calls = iter(
        [
            '{"approved": false, "feedback":"too rude"}',
            "Rewritten professional summary",
            '{"approved": true}',
        ]
    )

    def fake_chat(*args, **kwargs):
        return next(calls)

    monkeypatch.setattr("services.llm._chat", fake_chat)

    result = judge_and_revise("Terrible response", "summary")

    assert result == "Rewritten professional summary"
