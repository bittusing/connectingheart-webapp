            <Button variant="ghost" onClick={handleBack}>
              ◀ Back
            </Button>
            <Button onClick={() => setConfirmOpen(true)}>Next</Button>
          </div>
        </div>
      )
    }

    if (step === 6) {
      return (
        <div className="space-y-5">
          <UploadDropzone
            label="Profile Pic"
            required
            value={about.profilePic ?? undefined}
            onClick={() => setUploadTarget('profile')}
          />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tell us about yourself</span>
            <textarea
              rows={4}
              maxLength={125}
              value={about.bio}
              onChange={(event) =>
                setAbout((prev) => ({ ...prev, bio: event.target.value.slice(0, 125) }))
              }
              placeholder="Tell us about yourself"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
            />
            <span className="block text-right text-xs text-slate-400">
              {about.bio.length} / 125
            </span>
          </label>
          <Button size="lg" onClick={handleNext} fullWidth>
            Create my profile
          </Button>
          <button
            type="button"
            className="block w-full text-center text-sm font-semibold text-pink-600"
            onClick={handleNext}
          >
            I will fill this later
          </button>
          <Button variant="ghost" onClick={handleBack}>
            ◀ Back
          </Button>
        </div>
      )
    }