"""Numbered callouts in the style of the SWAFL manual: a red circle with a number, joined by a thin line to the point it names.
Used by p4_reach.py and p4_concept.py to save an annotated copy of each figure (fig*_annot.png) and the text of each label
(Manuscripts/results/p4_callouts.json), which the Supplementary Material prints under the figure."""
import json, os
RED = '#b3261e'
def callout(ax, n, xy, off, coords='data'):
    """xy: the point named (data or axes coordinates); off: offset of the circle in points."""
    ax.annotate(str(n), xy=xy, xycoords=coords if coords == 'data' else ax.transAxes, xytext=off, textcoords='offset points',
                ha='center', va='center', fontsize=7.5, fontweight='bold', color=RED, zorder=50,
                bbox=dict(boxstyle='circle,pad=0.25', fc='white', ec=RED, lw=1.2),
                arrowprops=dict(arrowstyle='-', color=RED, lw=1.0, shrinkA=0, shrinkB=1.5))
def store(fig_key, labels, root):
    p = os.path.join(root, 'Manuscripts/results/p4_callouts.json')
    d = json.load(open(p)) if os.path.exists(p) else {}
    d[fig_key] = labels; json.dump(d, open(p, 'w'), indent=1)
