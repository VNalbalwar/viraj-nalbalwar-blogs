# Hands-on notes

The notes lane only writes about things you really did. To queue a post:

1. Copy `_template.md` to `pipeline/notes/<short-name>.md`.
2. Fill it in with real commands, output and numbers.
3. Set `status: ready` in the frontmatter.

On the next notes slot the writer turns the oldest `ready` note into a post, and the pipeline marks the note `status: used`. With no ready notes, that slot becomes an explainer.
