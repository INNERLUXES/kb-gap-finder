# 1. TF-IDF, not embeddings

## Context

Matching tickets to articles by meaning would work better with embeddings from a language model. That needs a model call per text, sends ticket text to a provider or needs a local model, and gives slightly different results when the model changes.

## Decision

The tool uses TF-IDF and cosine similarity, computed in plain JavaScript.

## Consequences

The same files always give the same report, the tool runs anywhere with no account and no data leaving the machine, and a support lead can understand why two texts matched. Synonyms are matched weakly, as docs/limits.md says; the thresholds can be tuned per help center.
