class AppState {
	copySuccess = $state(false);
	copiedContext = $state('');
	formattedContext = $derived(this.toCapitalCase(this.copiedContext));

	toCapitalCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
}

const appState = new AppState();

export default appState;
