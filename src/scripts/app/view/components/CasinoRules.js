import './CasinoRules.scss';

// import service from 'sportsbook/service/ApiService.js';
import CasinoOptionsModel from 'sportsbook/model/CasinoOptionsModel';
import CasinoGamesModel from 'sportsbook/model/CasinoGamesModel';
import CasinoGame from 'widgets/casino/CasinoGame';
import deviceModel from 'sportsbook/model/DeviceModel';

class CasinoRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: [],
      supplier: null,
      device: '',
      hasFlash: false,
      images: [],
    };
    this.model = new CasinoOptionsModel();
  }

  componentWillMount() {
    CasinoGamesModel.on('set:games', ::this.updateGames);

    const { gameRules } = this.props,
      hasFlash = deviceModel.get('hasFlash'),
      device = deviceModel.get('device'),
      suppliers = gameRules.gameProvider.toLowerCase();

    let images = gameRules.imageUrl ? gameRules.imageUrl.split(',') : [],
      att = {};

    this.setState({ device, hasFlash });

    this.setState({ images });
    this.model.set({ suppliers });
  }

  componentWillUnmount() {
    CasinoGamesModel.off('set:games', this.updateGames);
  }

  updateGames() {
    const { gameRules } = this.props;

    const supplier = CasinoGamesModel.findSupplierByCode(this.model.get('suppliers'));
    if (!supplier) { return false; }

    const game = supplier.get('games').findGameById(gameRules.gameName);

    this.setState({ game, supplier });
  }

    /**
     * @returns {XML}
     */
  render() {
    const { gameRules } = this.props,
      { game } = this.state;

    let allImages = this.state.images.map((image, ind) => this.renderImage(image, ind)),
      imagesAvailable = allImages.length > 0;

    return (
      <div className="c-casino-rules">
        <div className="c-casino-rules__main-content">
          <div className="grid-center">
            <div className="col-6_md-12">
              <div className="c-casino-rules__main-content-panel c-casino-rules__main-content-panel--info">
                <div dangerouslySetInnerHTML={{ __html: gameRules.word }} />
              </div>
            </div>
            {imagesAvailable && (
              <div className="col-4_md-12 grid">
                <div className="col-12">
                  <div className="c-casino-rules__main-content-panel c-casino-rules__main-content-panel--images grid">
                    {allImages}
                  </div>
                </div>
              </div>
                        )}
          </div>
        </div>
      </div>
    );
  }

  renderImage(image) {
    const imagePath = `${App.Urls.bucketName}/${image}`;

    return (
      <div key={imagePath} className="col-12_md-12 c-casino-rules__main-content-panel--image-box">
        <img src={imagePath} alt="" className="c-casino-rules__main-content-panel--image" />
      </div>
    );
  }
}

export default CasinoRules;
