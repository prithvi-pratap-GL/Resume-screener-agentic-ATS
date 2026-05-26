from presidio_analyzer import (
    AnalyzerEngine
)
from presidio_anonymizer import (
    AnonymizerEngine
)

# singleton engines

analyzer = AnalyzerEngine()

anonymizer = AnonymizerEngine()

SAFE_ENTITIES = [
    "EMAIL_ADDRESS",
    "PHONE_NUMBER",
    "CREDIT_CARD",
    "IBAN_CODE",
    "US_SSN",
    "PASSPORT",
]

def scrub_pii(text: str) -> str:

    results = analyzer.analyze(
        text=text,
        language="en",
        entities=SAFE_ENTITIES
    )
    

    anonymized = (
        anonymizer
        .anonymize(
            text=text,
            analyzer_results=results
        )
    )
    print(results)
    print()
    print(anonymized.text)

    return anonymized.text