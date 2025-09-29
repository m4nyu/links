# Development Guidelines & Standards

## Core Principles
- **User Authority**: User controls all decisions, commits, and project direction
- **Clean Code First**: Prioritize readability, maintainability, and simplicity
- **Atomic Everything**: Small, focused changes in commits, functions, and PRs
- **Automation Without Attribution**: Tools assist but don't claim authorship
- **Language Agnostic**: Principles apply to any programming language or stack

---

## 1. Communication Protocol

### Check-in Standards
- **ALWAYS** check in with **user**, never with "Claude"
- Use direct, minimal communication
- Provide concise status updates without over-explanation
- **NEVER** commit code automatically without user approval

### Status Updates Format
```
STATUS: [Working on X]
COMPLETED: [What was done]
NEXT: [What needs review/decision]
BLOCKERS: [Any issues requiring user input]
```

---

## 2. Git Configuration & Commit Standards

### Author Configuration
```bash
# Always use current git user configuration
git config user.name  # Use existing
git config user.email # Use existing
```

### Commit Rules
- **NEVER** include "Generated with Claude Code" or AI attribution
- **NEVER** include "Co-Authored-By: Claude" or similar
- Use clean, technical commit messages only
- User controls all commits - AI suggests, user executes

### Conventional Commit Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types (Strict)
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change without fixing bug or adding feature
- `perf`: Performance improvement
- `test`: Add/update tests
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `chore`: Build process or auxiliary tool changes
- `revert`: Revert a previous commit
- `build`: Changes affecting build system
- `ci`: CI configuration changes

#### Commit Message Rules
- Subject: 50 characters max, imperative mood
- Body: 72 characters per line, explain what and why
- Footer: Breaking changes, issue references

### Atomic Commit Strategy
```bash
# One logical change per commit
git add -p  # Stage selectively
git commit -m "fix(auth): validate email format"

# Not this:
git add .
git commit -m "fix stuff"  # Too vague, multiple changes
```

#### Atomic Commit Checklist
- [ ] Single logical change
- [ ] Builds successfully
- [ ] Tests pass
- [ ] Can be reverted cleanly
- [ ] Under 200 lines changed
- [ ] Clear commit message

---

## 3. Code Quality Standards

### DRY Principle (Don't Repeat Yourself)
```
// BAD: Duplication
function validateEmail(email) {
  pattern = "email_regex_pattern"
  return match(email, pattern)
}

function checkEmail(email) {
  pattern = "email_regex_pattern"
  return match(email, pattern)
}

// GOOD: Single source of truth
EMAIL_PATTERN = "email_regex_pattern"

function validateEmail(email) {
  return match(email, EMAIL_PATTERN)
}
```

### AHA Principle (Avoid Hasty Abstractions)
- Allow duplication twice before abstracting
- Prefer duplication over wrong abstraction
- Refactor when pattern is clear

### Code Metrics
| Metric | Target | Maximum |
|--------|--------|---------|
| Cyclomatic Complexity | ≤ 5 | 10 |
| Cognitive Complexity | ≤ 10 | 15 |
| Function Length | ≤ 20 lines | 50 lines |
| File Length | ≤ 200 lines | 400 lines |
| Code Coverage | ≥ 80% | - |

### Naming Conventions
```
// GOOD: Descriptive, word-based names
userAuthenticationToken = generateToken()
function calculateTotalPrice()
class UserAccountManager

// BAD: Abbreviations, unclear names
tkn = genTkn()
function calc()
class UAM
```

### Self-Documenting Code
```
// BAD: Needs comments to understand
function proc(d) {
  // Process data for validation
  return filter(d, x > 0)
}

// GOOD: Code explains itself
function filterPositiveNumbers(numbers) {
  return filter(numbers, isPositive)
}
```

---

## 4. Development Process

### Pre-Development Checklist
1. **Check existing code** - Avoid reinventing
2. **Review README.md** - Understand project setup
3. **Verify commands** - Test all documented commands
4. **Plan approach** - Design before coding

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feat/user-authentication

# 2. Make atomic changes
# ... develop with small commits ...

# 3. Run quality checks
npm run lint
npm run typecheck
npm run test

# 4. Update documentation if needed
# ... update README.md ...

# 5. Prepare for review
git rebase -i main  # Clean up commit history
```

### File Creation Strategy
```bash
# For simple files (<100 lines)
# Create directly in final location

# For complex files (>100 lines)
# 1. Create outline
# 2. Implement incrementally
# 3. Test each component
# 4. Refactor for clarity
```

---

## 5. Project Structure & Configuration

### Essential Files
```
project/
├── README.md           # Comprehensive documentation
├── .gitignore         # Ignore patterns
├── .gitattributes     # Git configuration
├── .editorconfig      # Editor consistency
├── .env.example       # Environment template
├── LICENSE            # License information
└── [config files]     # Language-specific configs
```

### README.md Structure
```markdown
# Project Name

Brief description (1-2 sentences)

## Quick Start
\`\`\`bash
# Install dependencies
[install command]

# Run development
[dev command]
\`\`\`

## Features
- Key feature 1
- Key feature 2

## Installation
Detailed setup instructions

## Usage
Code examples with expected output

## Scripts/Commands
| Command | Description |
|---------|-------------|
| [dev] | Start development |
| [build] | Build production |
| [test] | Run tests |

## Configuration
Environment variables explanation

## Contributing
Guidelines for contributors

## License
[License Type]
```

### Project Scripts/Commands
```
Common commands across languages:
- dev/start: Start development server
- build/compile: Build for production
- test: Run test suite
- lint/check: Check code style
- format: Auto-format code
- clean: Remove build artifacts
- install/deps: Install dependencies
```

---

## 6. Testing Standards

### Test Structure
```
TestSuite: Component/Module
  TestCase: method/feature
    Test: should handle expected case
      // Arrange
      input = createTestData()
      
      // Act
      result = functionUnderTest(input)
      
      // Assert
      assert(result == expected)

    Test: should handle edge case
      // Test edge cases explicitly

    Test: should handle error case
      // Test error conditions
```

### Coverage Requirements
- Minimum: 80% overall
- Critical paths: 100%
- New code: 90%
- UI components: 70%

---

## 7. Code Review Guidelines

### Pull Request Size
- **Ideal**: < 200 lines
- **Maximum**: 400 lines
- **If larger**: Split into logical chunks

### PR Description Template
```markdown
## What
Brief description of changes

## Why
Context and motivation

## How to Test
1. Step-by-step instructions
2. Expected behavior

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No linter warnings
- [ ] Self-reviewed
```

### Review Focus Areas
1. **Logic correctness**
2. **Edge case handling**
3. **Performance implications**
4. **Security considerations**
5. **Code clarity**

---

## 8. Automation & Tools

### Language-Agnostic Tools
- **Version Control**: Git
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Code Quality**: SonarQube, CodeClimate
- **Security Scanning**: Snyk, OWASP tools
- **Documentation**: Markdown, AsciiDoc
- **Containerization**: Docker, Podman

### Pre-commit Hooks
```
# Example hook configuration
pre-commit:
  - lint/check code style
  - run tests
  - check commit message format
  
commit-msg:
  - validate conventional commit format
```

### CI/CD Pipeline
```yaml
# Example CI configuration
name: CI
on: [push, pull_request]
jobs:
  quality:
    steps:
      - checkout code
      - install dependencies
      - run linter
      - run tests
      - check build
      - security scan
```

### Quality Gates
- All tests pass
- No linter errors
- Type checking passes
- Coverage threshold met
- Build succeeds
- Security scan clean

---

## 9. Security & Performance

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Dependencies up to date

### Performance Standards
- Response time: < 200ms (p95)
- Memory usage: Within defined limits
- CPU usage: < 80% under normal load
- Startup time: < 5 seconds
- Throughput: Meet defined SLA

---

## 10. Documentation Standards

### Code Documentation
```
/**
 * Validates user email against RFC 5322 standard
 * @param email - User email address
 * @returns True if valid email format
 * @throws Error if email is invalid type
 */
function validateEmail(email) {
  // Implementation
}
```

### API Documentation
- Use standard API documentation tools (OpenAPI, Swagger, etc.)
- Include request/response examples
- Document error codes and handling
- Specify rate limits and constraints
- Version your API documentation

### Architecture Decision Records (ADRs)
```markdown
# ADR-001: Use TypeScript for Type Safety

## Status
Accepted

## Context
Need compile-time type checking to reduce runtime errors

## Decision
Use TypeScript with strict mode enabled

## Consequences
- Positive: Catch errors at compile time
- Negative: Additional build step required
```

---

## Command Reference

### Git Commands
```bash
# Atomic commits
git add -p                    # Stage selectively
git commit --amend           # Fix last commit
git rebase -i HEAD~3         # Clean up last 3 commits

# Branch management
git checkout -b feature/name  # Create feature branch
git rebase main              # Update with main
git branch -d feature/name   # Delete after merge
```

### Development Commands
```bash
# Quality checks (language-specific tools)
[lint command]              # Fix style issues
[test command]              # Run all tests
[test watch command]        # Watch mode
[type check command]        # Check types (if applicable)

# Build & Deploy
[build command]             # Production build
[run command]               # Run application
[clean command]             # Clean artifacts
```

---

## Quick Decision Framework

### When to Abstract
1. **Third occurrence** of similar code
2. **Clear pattern** emerges
3. **Multiple files** need same logic

### When to Split Files
1. File exceeds **200 lines**
2. Multiple **responsibilities**
3. Different **rate of change**

### When to Add Comments
1. **Complex algorithms** requiring explanation
2. **Non-obvious business logic**
3. **Workarounds** with context
4. Never for obvious code

### When to Refactor
1. Before adding **new feature** to messy code
2. When **fixing bugs** in complex area
3. When code **violates standards**
4. Not during critical deadlines

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
- [ ] Git commit conventions
- [ ] Basic linting setup
- [ ] README template
- [ ] Pre-commit hooks

### Phase 2: Quality (Week 2)
- [ ] Test coverage requirements
- [ ] PR templates
- [ ] CI/CD pipeline
- [ ] Code review process

### Phase 3: Excellence (Week 3+)
- [ ] Performance monitoring
- [ ] Security scanning
- [ ] Documentation generation
- [ ] Architecture decision records

---

## Success Metrics

| Metric | Target | Measure |
|--------|--------|---------|
| Review Cycle Time | < 24 hours | PR creation to merge |
| Defect Escape Rate | < 2% | Bugs found in production |
| Test Coverage | > 80% | Overall coverage |
| Build Success Rate | > 95% | Successful builds/total |
| Code Duplication | < 5% | Analyzed by tools |

---

## Language-Specific Adaptations

### Adapt These Guidelines To Your Stack
- **Python**: PEP 8, pytest, mypy, black
- **JavaScript/TypeScript**: ESLint, Jest, Prettier
- **Java**: Google Java Style, JUnit, Checkstyle
- **Go**: gofmt, go test, golint
- **Rust**: rustfmt, cargo test, clippy
- **C/C++**: clang-format, Google Test, cppcheck
- **Ruby**: RuboCop, RSpec, Bundler
- **PHP**: PSR standards, PHPUnit, PHP-CS-Fixer

### Key Principle
The standards remain constant - only the tools change based on language.

---

## Remember

1. **User owns the code** - No AI attribution ever
2. **Small is beautiful** - Atomic commits, focused functions
3. **Clarity over cleverness** - Readable code wins
4. **Test everything** - Especially edge cases
5. **Document decisions** - Not just outcomes
6. **Automate repetition** - Save human time for thinking
7. **Measure progress** - Data drives improvement

---

*These guidelines are living documentation. Update them as the team learns and grows.*
