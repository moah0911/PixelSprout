from flask import Blueprint, render_template

# Create blueprint
test_bp = Blueprint('test', __name__)

@test_bp.route('/test-api')
def test_api():
    """Test API page for debugging"""
    return render_template('test_api.html')