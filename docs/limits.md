# Limits

- **Words, not meaning.** Two texts that say the same thing in different words ("parcel" and "package") match weakly. Add common synonyms to your articles, or lower `--cover`.
- **English.** The stop word list and the endings are English. Other languages work, but less precisely.
- **Answer quality.** A ticket can match an article that mentions the topic without answering the question. Read the top gaps and the most used articles; the tool points to where to look, it does not judge the answer.
- **Contradictions.** Near-duplicate articles are found by similar wording. Two articles that disagree in different words are not found.
- **Masking.** Email addresses and runs of six or more digits are masked. Names and addresses written in words are not; keep reports inside the support team.
- **Size.** Every ticket is compared with every article in memory. Tens of thousands of tickets against a few thousand articles run in seconds; much larger sets should be split by period or product.
