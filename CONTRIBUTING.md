# Contributing to Wedding Invite Website

Thank you for your interest in contributing to the Wedding Invite Website! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and considerate of others
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- A clear description of the feature
- Use cases and examples
- Why this feature would be useful

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/wedding-invite.git
   cd wedding-invite
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes locally

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```
   Use clear, descriptive commit messages:
   - `Add: new feature description`
   - `Fix: bug description`
   - `Update: what was updated`
   - `Refactor: what was refactored`

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots if UI changes were made

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow React best practices
- Use meaningful variable and function names
- Keep components focused and reusable
- Add PropTypes or TypeScript types where applicable

### Project Structure

```
wedding-invite/
├── src/
│   ├── components/     # React components
│   ├── images/         # Image assets
│   └── siteConfig.js   # Main configuration file
├── netlify/
│   └── functions/      # Netlify serverless functions
├── public/             # Static files
└── screenshots/        # Screenshots for documentation
```

### Testing

Before submitting a PR:
- Test your changes in multiple browsers
- Test on mobile devices (responsive design)
- Ensure no console errors
- Verify all features still work as expected

### Documentation

- Update README.md if adding new features
- Add comments to complex code
- Update SETUP_GUIDE.md if setup process changes
- Add screenshots for UI changes

## Feature Guidelines

### Adding New Features

1. Check if the feature aligns with the project goals
2. Ensure it's configurable via `siteConfig.js`
3. Add feature flags if it should be optional
4. Update documentation
5. Add screenshots if it's a UI feature

### Configuration

All customization should be done through `src/siteConfig.js`. Avoid hardcoding values in components.

### Styling

- Use Tailwind CSS utility classes
- Follow the Apple-inspired design system
- Ensure mobile responsiveness
- Maintain consistent spacing and typography

## Questions?

Feel free to open an issue for questions or clarifications. We're here to help!

Thank you for contributing! 🎉

