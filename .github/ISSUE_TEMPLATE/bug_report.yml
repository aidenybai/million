name: "\U0001F41E Bug Report"
description: Report an Issue or a Bug

# Labels must be prepared in advance, otherwise no labels are applied

labels: ["pending triage"]
body:

- type: markdown
  attributes:
  value: Thank you for taking the time to fill out this bug report!
- type: textarea
  id: bug-env
  attributes:
  label: Environment
  description: Package and Node.js version can be helpful to investigate issues
  placeholder: Environment
  validations:
  required: true
- type: textarea
  id: reproduction
  attributes:
  label: Reproduction
  description: Please provide a link to a repo that can reproduce the problem you ran into. A **minimal reproduction** is required unless you are absolutely sure that the issue is obvious and the provided information is enough to understand the problem. If a report is vague (e.g. just a generic error message) and has no reproduction, it will receive a "need reproduction" label. If no reproduction is provided we might close it.
  placeholder: Reproduction
  validations:
  required: true
- type: textarea
  id: bug-description
  attributes:
  label: Describe the bug
  description: A clear and concise description of what the bug is. If you intend to submit a PR for this issue, tell us in the description. Thanks!
  placeholder: Bug description
  validations:
  required: true
- type: textarea
  id: additonal
  attributes:
  label: Additional context
  description: If applicable, add any other context about the problem here.
- type: textarea
  id: logs
  attributes:
  label: Logs
  description: Optional if provided reproduction. Please try not to insert an image but copy paste the log text.
  render: sh
