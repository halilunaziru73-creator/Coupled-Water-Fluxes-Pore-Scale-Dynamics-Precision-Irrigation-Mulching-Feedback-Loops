import matplotlib as mpl, matplotlib.pyplot as plt, numpy as np
mpl.rcParams.update({'font.family':'DejaVu Sans','font.size':8,'axes.labelsize':8.5,'axes.titlesize':8.5,'xtick.labelsize':7.5,'ytick.labelsize':7.5,
 'legend.fontsize':7,'axes.linewidth':0.7,'xtick.major.width':0.7,'ytick.major.width':0.7,'lines.linewidth':1.3,'axes.spines.top':False,'axes.spines.right':False,
 'figure.dpi':150,'savefig.dpi':300,'savefig.bbox':'tight','pdf.fonttype':42,'axes.edgecolor':'#444444','axes.labelcolor':'#222222','text.color':'#222222','xtick.color':'#222222','ytick.color':'#222222'})
OI=['#0072B2','#E69F00','#009E73','#D55E00','#CC79A7','#56B4E9','#F0E442','#8C564B','#7F7F7F','#1B9E77']
def panel(ax,letter,x=-0.14,y=1.04): ax.text(x,y,letter,transform=ax.transAxes,fontsize=10,fontweight='bold',va='bottom',ha='left',color='#222222')
def save(fig,name,d):
    fig.savefig(f'{__import__("os").environ.get("SWAFL_MS",".")}/fig/{d}/{name}.png'); fig.savefig(f'{__import__("os").environ.get("SWAFL_MS",".")}/fig/{d}/{name}.pdf'); plt.close(fig)
