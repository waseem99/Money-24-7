"""Promote a reviewed draft only; this validates review evidence, not visual quality."""
import argparse, hashlib, json, shutil
from pathlib import Path
CHECKS = ("facial_proportions", "body_proportions", "skin_highlights", "clothing_highlights", "temporal_consistency", "lip_sync", "voice_identity", "graphics_accuracy", "face_clearance")
def digest(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""): h.update(block)
    return h.hexdigest()
def validate(draft, review):
    if review.get("draft_sha256") != digest(draft): raise ValueError("Review missing or stale for this exact draft")
    for key in ("reviewed_by", "reviewed_at", "notes"):
        if not isinstance(review.get(key), str) or not review[key].strip(): raise ValueError("Missing " + key)
    if review.get("moving_video_reviewed") is not True: raise ValueError("Moving footage must be reviewed")
    if review.get("open_blockers") != []: raise ValueError("Open or unspecified visual blockers")
    for check in CHECKS:
        item = review.get("checks", {}).get(check, {})
        if item.get("status") != "pass" or not isinstance(item.get("evidence"), str) or not item["evidence"].strip():
            raise ValueError("Missing pass with evidence: " + check)
    refs = review.get("approved_references")
    if not isinstance(refs, list) or not refs: raise ValueError("Approved master references required")
    for ref in refs:
        if not ref.get("approval_record") or digest(ref["path"]) != ref.get("sha256"): raise ValueError("Missing approval or changed master reference")
def main():
    p=argparse.ArgumentParser();p.add_argument("draft",type=Path);p.add_argument("review",type=Path);p.add_argument("output",type=Path)
    a=p.parse_args()
    if a.output.exists(): p.error("Output already exists; use a new version")
    try: validate(a.draft,json.loads(a.review.read_text()))
    except (ValueError,KeyError,TypeError,OSError) as e: p.exit(1,"Release blocked: "+str(e)+"\n")
    a.output.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(a.draft,a.output)
    shutil.copy2(a.review,a.output.with_suffix(".review.json"))
    print("Released reviewed draft:",a.output)
if __name__=="__main__": main()
