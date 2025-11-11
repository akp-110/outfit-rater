import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, TrendingUp, Flame, Smile } from 'lucide-react';

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('balanced');
  const fileInputRef = useRef(null);

  const modes = {
    professional: { icon: TrendingUp, label: 'Professional', emoji: '👔' },
    balanced: { icon: Sparkles, label: 'Balanced', emoji: '✨' },
    hype: { icon: Flame, label: 'Hype Mode', emoji: '🔥' },
    roast: { icon: Smile, label: 'Roast Mode', emoji: '😈' }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setRating(null);
    }
  };

  const getModePrompt = () => {
    const prompts = {
      professional: "You are a professional fashion consultant. Be constructive, polite, and focus on workplace appropriateness.",
      balanced: "You are a friendly fashion advisor. Be honest but encouraging, offering helpful suggestions.",
      hype: "You are the user's biggest fan! Be enthusiastic and supportive. Find the positives in everything!",
      roast: "You are a witty fashion critic. Be funny and honest with playful roasting, but never cruel. Keep it lighthearted!"
    };
    return prompts[mode];
  };

  const getRating = async () => {
    if (!photo) {
      alert('Please upload a photo first!');
      return;
    }

    setLoading(true);
    setRating(null);

    try {
      // Convert photo to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'YOUR_API_KEY_HERE', // REPLACE THIS WITH YOUR ACTUAL API KEY
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: base64Image
                    }
                  },
                  {
                    type: 'text',
                    text: `${getModePrompt()}

Rate this outfit and provide feedback. Structure your response as:

**Overall Rating: X/10** ⭐

**Breakdown:**
- Style: X/10
- Weather Appropriateness: X/10
- Versatility: X/10

**What Works:**
[2-3 specific positive points]

**Suggestions:**
[2-3 specific improvements]

${mode === 'roast' ? '**The Roast:**\n[Your wittiest observation]' : ''}

Be specific and helpful!`
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();

        // Check for errors
        if (data.error) {
          throw new Error(data.error.message || 'API request failed');
        }

        const ratingText = data.content[0].text;
        setRating(ratingText);
        setLoading(false);
      };

      reader.onerror = () => { setLoading(false);
        throw new Error('Failed to read image file');
      };

      reader.readAsDataURL(photo);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to get rating: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            👗 Claude Rates My Outfit
          </h1>
          <p className="text-gray-600 text-lg">
            Get honest fashion feedback powered by AI
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose Your Vibe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(modes).map(([key, { icon: Icon, label, emoji }]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === key
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="font-semibold text-sm">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!photoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-400 transition-colors"
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Upload Your Outfit Photo
              </p>
              <p className="text-gray-500">Click to select or drag & drop</p>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={photoPreview}
                alt="Your outfit"
                className="w-full max-h-96 object-contain rounded-xl"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  onClick={getRating}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Rating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Rate My Outfit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rating Display */}
        {rating && (
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{modes[mode].emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800">
                Claude's Verdict
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              {rating.split('\n').map((line, i) => (
                <p key={i} className="mb-3 text-gray-700 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                💡 Try different modes for different perspectives!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Claude 4 × Anthropic API</p>
          <p className="mt-2">#ClaudeRatesMyOutfit</p>
        </div>
      </div>
    </div>
  );
}
