#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-notes-manager-3f9e8889/notes_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

